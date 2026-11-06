import './play.css'
import { Dom } from 'Client/Service/Dom'
import { loadLegacyPlacements } from 'Client/Service/load-legacy-placements'
import { projectRepository } from 'Client/Service/Repository/ProjectRepository'
import { sheetRepository } from 'Client/Service/Repository/SheetRepository'
import { MAP_QUERY_PARAM } from 'Client/Service/active-map'
import { buildScene } from 'Client/Service/build-scene'
import { canvasDrawPort } from 'Client/Service/canvas-draw-port'
import { HeldDirections } from 'Client/Service/held-directions'
import { findMap, GameMap, playerSprite, Project, startMap } from 'domain/project'
import { crossEdge } from 'domain/connection'
import { isInside, isSolid } from 'domain/map'
import { Scene } from 'engine/scene'
import { PortSize } from 'engine/draw-port'
import { CanEnter } from 'domain/movement'
import { Id } from 'domain/id'
import { stepRule } from 'domain/collision'
import { GRID_SIZE } from 'domain/grid'
import { Direction, insideMap, newPlayer, Player, playerPixel, stepPlayer } from 'domain/movement'
import { LoadedPlacement } from 'Client/Model/LoadedPlacement'
import { cameraFor, GBA_VIEW, integerScale } from 'engine/camera'
import { startLoop } from 'engine/loop'
import { playerActor } from 'engine/player-actor'
import { renderFrame } from 'engine/render'
import { View } from 'engine/view'

const held = new HeldDirections()

/** Held while a direction is held, like B on the GBA, to run instead of walk. */
let running = false

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

function releaseAllKeys(): void {
    held.clear()
    running = false
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

/** Everything the loop needs for the map the player is on. Rebuilt when they cross a seam. */
type OpenMap = {
    readonly map: GameMap

    readonly scene: Scene<CanvasImageSource>

    readonly canEnter: CanEnter

    readonly pixels: PortSize
}

function openMap(
    project: Project,
    map: GameMap,
    sheetById: ReadonlyMap<Id, CanvasImageSource>,
    legacyPlacements: ReadonlyMap<Id, readonly LoadedPlacement[]>,
): OpenMap {
    const tileset = projectRepository.cachedTileset(map.tileMap.tilesetId)
    const scene = buildScene({
        tileMap: map.tileMap,
        tileset,
        sheetById,
        layers: map.layers,
        loadedPlacements: legacyPlacements.get(map.id) ?? [],
    })
    // Without a tileset there are no metatile attributes to consult; only the edge blocks.
    const onThisMap: CanEnter = tileset === undefined ? insideMap(map.tileMap) : stepRule(map.tileMap, tileset)
    const sizeOf = (mapId: Id) => findMap(project, mapId)?.tileMap

    /** Inside the map the collision rule decides; beyond an edge a connection may let the step through. */
    const canEnter: CanEnter = (from, to) => {
        if (isInside(map.tileMap, to)) {
            return onThisMap(from, to)
        }

        const crossing = crossEdge(map.tileMap, map.connections, to, sizeOf)
        const destination = crossing === undefined ? undefined : findMap(project, crossing.mapId)

        if (crossing === undefined || destination === undefined) {
            return false
        }

        const destinationTileset = projectRepository.cachedTileset(destination.tileMap.tilesetId)

        return destinationTileset === undefined || !isSolid(destination.tileMap, destinationTileset, crossing.cell)
    }

    return {
        map,
        scene,
        canEnter,
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
    let open = openMap(project, map, sheetById, legacyPlacements)
    let player = newPlayer(map.spawn)

    startLoop(deltaSeconds => {
        player = stepPlayer(player, { direction: held.latest(), running }, deltaSeconds * 1000, open.canEnter)

        // A finished step that ended beyond the edge was allowed by a connection: continue on the other map.
        if (player.step === null && !isInside(open.map.tileMap, player.cell)) {
            const crossing = crossEdge(open.map.tileMap, open.map.connections, player.cell, mapId => findMap(project, mapId)?.tileMap)
            const destination = crossing === undefined ? undefined : findMap(project, crossing.mapId)

            if (crossing !== undefined && destination !== undefined) {
                open = openMap(project, destination, sheetById, legacyPlacements)
                player = newPlayer(crossing.cell, player.facing)
            }
        }

        renderFrame(port, open.scene, followPlayer(player, open.pixels, zoom), [playerActor(player, sprite, spriteSheet)])
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
