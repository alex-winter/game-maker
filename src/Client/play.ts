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
import { Direction, insideMap, newPlayer, stepPlayer } from 'domain/movement'
import { PortSize } from 'engine/draw-port'
import { startLoop } from 'engine/loop'
import { playerActor } from 'engine/player-actor'
import { renderFrame } from 'engine/render'
import { Actor } from 'engine/scene'

const view: { x: number; y: number; zoom: number } = {
    x: 0,
    y: 0,
    zoom: 2,
}

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

function fitCanvasToWindow(canvas: HTMLCanvasElement): void {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
}

/** The camera keeps the player in the middle of the window. */
function followActor(port: PortSize, actor: Actor<CanvasImageSource>): void {
    view.x = Math.round(actor.x + actor.width / 2 - port.width / (2 * view.zoom))
    view.y = Math.round(actor.y + actor.height / 2 - port.height / (2 * view.zoom))
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

    fitCanvasToWindow(canvas)
    window.addEventListener('resize', () => fitCanvasToWindow(canvas))

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
    let player = newPlayer(map.spawn)

    startLoop(deltaSeconds => {
        player = stepPlayer(player, { direction: held.latest(), running }, deltaSeconds * 1000, canEnter)

        const actor = playerActor(player, sprite, spriteSheet)

        followActor(port, actor)
        renderFrame(port, scene, view, [actor])
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
