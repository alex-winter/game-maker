import './play.css'
import { Dom } from 'Client/Service/Dom'
import { loadLegacyPlacements } from 'Client/Service/load-legacy-placements'
import { projectRepository } from 'Client/Service/Repository/ProjectRepository'
import { sheetRepository } from 'Client/Service/Repository/SheetRepository'
import { MAP_QUERY_PARAM } from 'Client/Service/active-map'
import { buildScene } from 'Client/Service/build-scene'
import { canvasDrawPort } from 'Client/Service/canvas-draw-port'
import { HeldDirections } from 'Client/Service/held-directions'
import { findDialog, findMap, GameMap, playerSprite, Project, startMap } from 'domain/project'
import { isSolid } from 'domain/map'
import { Scene } from 'engine/scene'
import { PortSize } from 'engine/draw-port'
import { CanEnter } from 'domain/movement'
import { Id } from 'domain/id'
import { stepRule } from 'domain/collision'
import { GRID_SIZE } from 'domain/grid'
import { Direction, insideMap, Player, playerPixel } from 'domain/movement'
import { LoadedPlacement } from 'Client/Model/LoadedPlacement'
import { cameraFor, GBA_VIEW, integerScale } from 'engine/camera'
import { fadeOpacity } from 'engine/fade'
import { advanceField, FieldWorld, newField } from 'engine/field'
import { startLoop } from 'engine/loop'
import { playerActor } from 'engine/player-actor'
import { renderFrame } from 'engine/render'
import { drawMessageBox } from 'engine/message'
import { View } from 'engine/view'

const held = new HeldDirections()

/** Held while a direction is held, like B on the GBA, to run instead of walk. */
let running = false

/** Set on the interact key's keydown and consumed by the next frame, so one press is one look. */
let interactPressed = false

const directionByCode: { readonly [code: string]: Direction | undefined } = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    KeyW: 'up',
    KeyS: 'down',
    KeyA: 'left',
    KeyD: 'right',
}

const RUN_CODES: readonly string[] = ['ShiftLeft', 'ShiftRight', 'KeyX']

/** A, like the GBA: Z, Enter, or Space. */
const INTERACT_CODES: readonly string[] = ['KeyZ', 'Enter', 'Space']

function releaseAllKeys(): void {
    held.clear()
    running = false
    interactPressed = false
}

/**
 * The canvas is the 240×160 view at the largest whole scale that fits the
 * window; the page's black body is the letterbox around it. Returns the scale.
 */
function fitCanvasToWindow(canvas: HTMLCanvasElement): number {
    const scale = integerScale({ width: window.innerWidth, height: window.innerHeight })

    canvas.width = GBA_VIEW.width * scale
    canvas.height = GBA_VIEW.height * scale

    return scale
}

/** The view that keeps the player's cell centred until the map edge stops it. */
function followPlayer(player: Player, mapPixels: { width: number; height: number }, zoom: number): View {
    const pixel = playerPixel(player)
    const camera = cameraFor({ x: pixel.x + GRID_SIZE / 2, y: pixel.y + GRID_SIZE / 2 }, GBA_VIEW, mapPixels)

    return { ...camera, zoom }
}

async function loadSheets(): Promise<Map<Id, CanvasImageSource>> {
    const sheets = await sheetRepository.getAll()
    const images = await Promise.all(sheets.map(sheet => Dom.image(sheet.imageSrc)))

    return new Map(sheets.map((sheet, index) => [sheet.id, images[index]]))
}

/**
 * The map the session opens: `?map=<id>` when the editor asked to try a
 * particular map, else the project's start map (or its first map).
 */
function sessionMap(search: string, project: Project) {
    const requested = new URLSearchParams(search).get(MAP_QUERY_PARAM)
    const tried = requested === null ? undefined : findMap(project, requested)

    return tried ?? startMap(project)
}

/** Everything the loop needs to draw the map the player is on. Rebuilt when they cross to another. */
type OpenMap = {
    readonly map: GameMap

    readonly scene: Scene<CanvasImageSource>

    readonly pixels: PortSize
}

/** The within-map rule: collision, elevation, and ledges, or only the edge for a map without a tileset. */
function ruleFor(map: GameMap): CanEnter {
    const tileset = projectRepository.cachedTileset(map.tileMap.tilesetId)

    return tileset === undefined ? insideMap(map.tileMap) : stepRule(map.tileMap, tileset)
}

/** Answers the field session's questions from the loaded project. */
function worldOf(project: Project): FieldWorld {
    const rules = new Map<Id, CanEnter>()

    return {
        sizeOf: mapId => findMap(project, mapId)?.tileMap,
        canEnter: mapId => {
            const cached = rules.get(mapId)

            if (cached !== undefined) {
                return cached
            }

            const map = findMap(project, mapId)
            const rule: CanEnter = map === undefined ? () => false : ruleFor(map)

            rules.set(mapId, rule)

            return rule
        },
        isSolidAt: (mapId, cell) => {
            const map = findMap(project, mapId)
            const tileset = map === undefined ? undefined : projectRepository.cachedTileset(map.tileMap.tilesetId)

            return map !== undefined && tileset !== undefined && isSolid(map.tileMap, tileset, cell)
        },
        connectionsOf: mapId => findMap(project, mapId)?.connections ?? {},
        eventsOf: mapId => findMap(project, mapId)?.events ?? [],
        pagesOf: dialogId => findDialog(project, dialogId)?.pages,
    }
}

function openMap(
    map: GameMap,
    sheetById: ReadonlyMap<Id, CanvasImageSource>,
    legacyPlacements: ReadonlyMap<Id, readonly LoadedPlacement[]>,
): OpenMap {
    const scene = buildScene({
        tileMap: map.tileMap,
        tileset: projectRepository.cachedTileset(map.tileMap.tilesetId),
        sheetById,
        layers: map.layers,
        loadedPlacements: legacyPlacements.get(map.id) ?? [],
    })

    return {
        map,
        scene,
        pixels: { width: map.tileMap.width * GRID_SIZE, height: map.tileMap.height * GRID_SIZE },
    }
}

/** A plain message in place of the canvas, for a project that cannot start. */
function showMessage(canvas: HTMLCanvasElement, text: string): void {
    const message = document.createElement('p')

    message.className = 'message'
    message.textContent = text
    canvas.replaceWith(message)
}

document.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.querySelector('canvas')
    const ctx = canvas?.getContext('2d')

    if (!canvas || !ctx) {
        return
    }

    let zoom = fitCanvasToWindow(canvas)

    window.addEventListener('resize', () => {
        zoom = fitCanvasToWindow(canvas)
    })

    const project = await projectRepository.load()
    const map = sessionMap(window.location.search, project)

    if (map === undefined) {
        showMessage(canvas, 'This project has no maps to play. Create one in the editor and mark it as the start map.')
        return
    }

    const sheetById = await loadSheets()
    const sprite = playerSprite(project)
    const spriteSheet = sprite === undefined ? undefined : sheetById.get(sprite.sheetId)
    // Legacy placements for every map up front, so crossing a seam never waits on the network.
    const legacyPlacements = new Map<Id, readonly LoadedPlacement[]>(
        await Promise.all(project.maps.map(async each => [each.id, await loadLegacyPlacements(each.layers)] as const)),
    )
    const port = canvasDrawPort(ctx)
    const world = worldOf(project)
    let open = openMap(map, sheetById, legacyPlacements)
    let field = newField(map.id, map.spawn)

    startLoop(deltaSeconds => {
        field = advanceField(field, { direction: held.latest(), running, interact: interactPressed }, deltaSeconds * 1000, world)
        interactPressed = false

        // The session changed map at the black point of a fade: draw the new one from now on.
        if (field.mapId !== open.map.id) {
            const next = findMap(project, field.mapId)

            if (next !== undefined) {
                open = openMap(next, sheetById, legacyPlacements)
            }
        }

        const player = field.player

        renderFrame(port, open.scene, followPlayer(player, open.pixels, zoom), [playerActor(player, sprite, spriteSheet)])

        if (field.message !== null) {
            drawMessageBox(port, field.message, GBA_VIEW, zoom)
        }

        const darkness = fadeOpacity(field.fade)

        if (darkness > 0) {
            port.fillRect(0, 0, port.width, port.height, `rgba(0, 0, 0, ${darkness.toFixed(3)})`)
        }
    }, callback => window.requestAnimationFrame(callback))
})

window.addEventListener('keydown', (event: KeyboardEvent) => {
    const direction = directionByCode[event.code]

    if (direction) {
        event.preventDefault()
        held.press(direction)
    }

    if (RUN_CODES.includes(event.code)) {
        running = true
    }

    if (INTERACT_CODES.includes(event.code) && !event.repeat) {
        event.preventDefault()
        interactPressed = true
    }
})

window.addEventListener('keyup', (event: KeyboardEvent) => {
    const direction = directionByCode[event.code]

    if (direction) {
        held.release(direction)
    }

    if (RUN_CODES.includes(event.code)) {
        running = false
    }
})

window.addEventListener('blur', releaseAllKeys)
