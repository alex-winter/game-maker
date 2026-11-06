import './play.css'
import { Dom } from 'Client/Service/Dom'
import { placementImageRepository } from 'Client/Service/Repository/PlacementImageRepository'
import { LoadedPlacement } from 'Client/Model/LoadedPlacement'
import { Coordinates } from 'domain/coordinates'
import { layerRepository } from 'Client/Service/Repository/LayerRepository'
import { projectRepository } from 'Client/Service/Repository/ProjectRepository'
import { sheetRepository } from 'Client/Service/Repository/SheetRepository'
import { activeMapId } from 'Client/Service/active-map'
import { buildScene } from 'Client/Service/build-scene'
import { canvasDrawPort } from 'Client/Service/canvas-draw-port'
import { Layer } from 'Model/Layer'
import { directionFromKeys, HeldKeys } from 'Client/Service/direction-from-keys'
import { findMap } from 'domain/project'
import { Id } from 'domain/id'
import { startLoop } from 'engine/loop'
import { renderFrame } from 'engine/render'

const viewCoordinates: Coordinates = {
    x: 0,
    y: 0,
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

function moveCamera(deltaSeconds: number): void {
    const direction = directionFromKeys(keys)

    viewCoordinates.x += direction.x * pixelsPerSecond * deltaSeconds
    viewCoordinates.y += direction.y * pixelsPerSecond * deltaSeconds
}

async function loadPlacements(layers: Layer[]): Promise<LoadedPlacement[]> {
    const loadedPlacements: LoadedPlacement[] = []

    for (const layer of layers) {
        for (const placement of layer.placements) {
            const placementImage = await placementImageRepository.getByUuid(
                placement.imageUuid
            )

            if (!placementImage) {
                console.warn('could not find placement image', placement.imageUuid)
                continue
            }

            const image = await Dom.image(placementImage.src)

            loadedPlacements.push({
                uuid: placement.uuid,
                layerUuid: layer.uuid,
                image,
                x: placement.coordinate.x,
                y: placement.coordinate.y,
                width: image.width,
                height: image.height,
            })
        }
    }

    return loadedPlacements
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

    layerRepository.useMap(map.id)

    const layers = await layerRepository.getAll()
    const scene = buildScene({
        tileMap: map.tileMap,
        tileset: projectRepository.cachedTileset(map.tileMap.tilesetId),
        sheetById: await loadSheets(),
        layers,
        loadedPlacements: await loadPlacements(layers),
    })
    const port = canvasDrawPort(ctx)

    startLoop(deltaSeconds => {
        moveCamera(deltaSeconds)
        renderFrame(port, scene, viewCoordinates)
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
