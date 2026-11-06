import './play.css'
import { Dom } from 'Client/Service/Dom'
import { loadLegacyPlacements } from 'Client/Service/load-legacy-placements'
import { projectRepository } from 'Client/Service/Repository/ProjectRepository'
import { sheetRepository } from 'Client/Service/Repository/SheetRepository'
import { activeMapId } from 'Client/Service/active-map'
import { buildScene } from 'Client/Service/build-scene'
import { canvasDrawPort } from 'Client/Service/canvas-draw-port'
import { HeldDirections } from 'Client/Service/held-directions'
import { findMap, playerSprite } from 'domain/project'
import { Id } from 'domain/id'
import { stepRule } from 'domain/collision'
import { GRID_SIZE } from 'domain/grid'
import { Direction, insideMap, newPlayer, Player, playerPixel, stepPlayer } from 'domain/movement'
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
    const mapId = activeMapId(window.location.search, project)
    const map = mapId === undefined ? undefined : findMap(project, mapId)

    if (map === undefined) {
        return
    }

    const sheetById = await loadSheets()
    const tileset = projectRepository.cachedTileset(map.tileMap.tilesetId)
    const sprite = playerSprite(project)
    const spriteSheet = sprite === undefined ? undefined : sheetById.get(sprite.sheetId)
    const scene = buildScene({
        tileMap: map.tileMap,
        tileset,
        sheetById,
        layers: map.layers,
        loadedPlacements: await loadLegacyPlacements(map.layers),
    })
    const port = canvasDrawPort(ctx)
    // Without a tileset there are no metatile attributes to consult; only the edge blocks.
    const canEnter = tileset === undefined ? insideMap(map.tileMap) : stepRule(map.tileMap, tileset)
    const mapPixels = { width: map.tileMap.width * GRID_SIZE, height: map.tileMap.height * GRID_SIZE }
    let player = newPlayer(map.spawn)

    startLoop(deltaSeconds => {
        player = stepPlayer(player, { direction: held.latest(), running }, deltaSeconds * 1000, canEnter)

        renderFrame(port, scene, followPlayer(player, mapPixels, zoom), [playerActor(player, sprite, spriteSheet)])
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
