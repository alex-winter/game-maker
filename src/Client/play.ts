import './play.css'
import { Dom } from 'Client/Service/Dom'
import { loadLegacyPlacements } from 'Client/Service/load-legacy-placements'
import { projectRepository } from 'Client/Service/Repository/ProjectRepository'
import { sheetRepository } from 'Client/Service/Repository/SheetRepository'
import { activeMapId } from 'Client/Service/active-map'
import { buildScene } from 'Client/Service/build-scene'
import { canvasDrawPort } from 'Client/Service/canvas-draw-port'
import { directionFromKeys, HeldKeys } from 'Client/Service/direction-from-keys'
import { findMap } from 'domain/project'
import { GRID_SIZE } from 'domain/grid'
import { Id } from 'domain/id'
import { PortSize } from 'engine/draw-port'
import { startLoop } from 'engine/loop'
import { renderFrame } from 'engine/render'

const view: { x: number; y: number; zoom: number } = {
    x: 0,
    y: 0,
    zoom: 2,
}

/** The stand-in actor until T-026: one cell, moved by the arrow keys, drawn between the ground and overhead passes. */
const actor: { x: number; y: number; readonly width: number; readonly height: number; readonly color: string } = {
    x: 0,
    y: 0,
    width: GRID_SIZE,
    height: GRID_SIZE,
    color: '#ff5252',
}

const pixelsPerSecond: number = 120

const keys: { -readonly [K in keyof HeldKeys]: HeldKeys[K] } = {
    up: false,
    down: false,
    left: false,
    right: false,
}

const keyByCode: { readonly [code: string]: keyof HeldKeys | undefined } = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
}

function releaseAllKeys(): void {
    keys.up = false
    keys.down = false
    keys.left = false
    keys.right = false
}

function fitCanvasToWindow(canvas: HTMLCanvasElement): void {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
}

function moveActor(deltaSeconds: number): void {
    const direction = directionFromKeys(keys)

    actor.x += direction.x * pixelsPerSecond * deltaSeconds
    actor.y += direction.y * pixelsPerSecond * deltaSeconds
}

/** The camera keeps the actor in the middle of the window. */
function followActor(port: PortSize): void {
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

    const scene = buildScene({
        tileMap: map.tileMap,
        tileset: projectRepository.cachedTileset(map.tileMap.tilesetId),
        sheetById: await loadSheets(),
        layers: map.layers,
        loadedPlacements: await loadLegacyPlacements(map.layers),
    })
    const port = canvasDrawPort(ctx)

    actor.x = Math.floor(map.tileMap.width / 2) * GRID_SIZE
    actor.y = Math.floor(map.tileMap.height / 2) * GRID_SIZE

    startLoop(deltaSeconds => {
        moveActor(deltaSeconds)
        followActor(port)
        renderFrame(port, scene, view, [actor])
    }, callback => window.requestAnimationFrame(callback))
})

window.addEventListener('keydown', (event: KeyboardEvent) => {
    const key = keyByCode[event.code]

    if (key) {
        event.preventDefault()
        keys[key] = true
    }
})

window.addEventListener('keyup', (event: KeyboardEvent) => {
    const key = keyByCode[event.code]

    if (key) {
        keys[key] = false
    }
})

window.addEventListener('blur', releaseAllKeys)
