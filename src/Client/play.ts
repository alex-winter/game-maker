import './play.css'
import { Dom } from 'Client/Service/Dom'
import { placementImageRepository } from 'Client/Service/Repository/PlacementImageRepository'
import { LoadedPlacement } from 'Client/Model/LoadedPlacement'
import { Coordinates } from 'Model/Coordinates'
import { layerRepository } from 'Client/Service/Repository/LayerRepository'
import { Layer } from 'Model/Layer'
import { drawOrder } from 'Model/draw-order'
import { directionFromKeys, HeldKeys } from 'Client/Service/direction-from-keys'

interface GamePlacement extends LoadedPlacement {
    type: string
}

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

function fitCanvasToWindow(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    // resizing a canvas resets its context state
    ctx.imageSmoothingEnabled = false
}

function moveCamera(deltaSeconds: number): void {
    const direction = directionFromKeys(keys)

    viewCoordinates.x += direction.x * pixelsPerSecond * deltaSeconds
    viewCoordinates.y += direction.y * pixelsPerSecond * deltaSeconds
}

function drawPlacements(
    ctx: CanvasRenderingContext2D,
    loadedPlacements: GamePlacement[],
    width: number,
    height: number,
): void {
    ctx.clearRect(0, 0, width, height)

    for (const loadedPlacement of loadedPlacements) {
        ctx.drawImage(
            loadedPlacement.image,
            Math.floor(loadedPlacement.x - viewCoordinates.x),
            Math.floor(loadedPlacement.y - viewCoordinates.y),
            loadedPlacement.image.width,
            loadedPlacement.image.height,
        )
    }
}

async function loadPlacements(layers: Layer[]): Promise<GamePlacement[]> {
    const loadedPlacements: GamePlacement[] = []

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
                type: layer.type,
            })
        }
    }

    return loadedPlacements
}

/** Back first, so a later draw covers an earlier one: ascending drawOrder. */
function sortBackToFront(layers: Layer[]): Layer[] {
    return [...layers].sort((a, b) => drawOrder(a) - drawOrder(b))
}

function startLoop(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    loadedPlacements: GamePlacement[],
): void {
    let lastTime = performance.now()

    const frame = (now: number): void => {
        const deltaSeconds = Math.min((now - lastTime) / 1000, 0.1)
        lastTime = now

        moveCamera(deltaSeconds)
        drawPlacements(ctx, loadedPlacements, canvas.width, canvas.height)

        window.requestAnimationFrame(frame)
    }

    window.requestAnimationFrame(frame)
}

document.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.querySelector('canvas')
    const ctx = canvas?.getContext('2d')

    if (!canvas || !ctx) {
        return
    }

    fitCanvasToWindow(canvas, ctx)
    window.addEventListener('resize', () => fitCanvasToWindow(canvas, ctx))

    const layers = sortBackToFront(await layerRepository.getAll())
    const loadedPlacements = await loadPlacements(layers)

    startLoop(canvas, ctx, loadedPlacements)
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
