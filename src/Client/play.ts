import './play.css'
import { Dom } from 'Client/Service/Dom'
import { placementImageRepository } from 'Client/Service/Repository/PlacementImageRepository'
import { LoadedPlacement } from 'Client/Model/LoadedPlacement'
import { Coordinates } from 'Model/Coordinates'
import { LAYERS } from 'Client/Constants/layers'
import { layerRepository } from 'Client/Service/Repository/LayerRepository'

interface GamePlacement extends LoadedPlacement {
    type: string
}

const viewCoordinates: Coordinates = {
    x: 0,
    y: 0,
}

const viewMoveSpeed: number = 4

const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
}

function renderLayers(
    ctx: CanvasRenderingContext2D,
    loadedPlacements: GamePlacement[],
    width: number,
    height: number,
): void {
    ctx.clearRect(0, 0, width, height)

    loadedPlacements.forEach(loadedPlacement => {
        const dx: number = loadedPlacement.x - viewCoordinates.x
        const dy: number = loadedPlacement.y - viewCoordinates.y
        const dWidth: number = loadedPlacement.image.width
        const dHeight: number = loadedPlacement.image.height

        ctx.drawImage(
            loadedPlacement.image,
            dx,
            dy,
            dWidth,
            dHeight,
        )
    })

    window.requestAnimationFrame(() => renderLayers(ctx, loadedPlacements, width, height))
}


document.addEventListener('DOMContentLoaded', async () => {
    const loadedPlacements: GamePlacement[] = []

    const canvas = document.querySelector('canvas')!
    const ctx = canvas.getContext('2d')!

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight


    const layers = (await layerRepository.getAll()).sort((a, b) => b.order - a.order)

    console.log('layers', layers)

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
                uuid: crypto.randomUUID(),
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

    // build map of layer order and sort placements so draw order matches layer order
    const layerOrderMap = new Map(layers.map(l => [l.uuid, l.order]))
    loadedPlacements.sort((a, b) => {
        const ao = layerOrderMap.get(a.layerUuid) ?? 0
        const bo = layerOrderMap.get(b.layerUuid) ?? 0
        return bo - ao
    })

    renderLayers(ctx, loadedPlacements, canvas.width, canvas.height)

})



window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.code === 'ArrowUp') {
        viewCoordinates.y -= viewMoveSpeed
    }

    if (e.code === 'ArrowDown') {
        viewCoordinates.y += viewMoveSpeed
    }

    if (e.code === 'ArrowLeft') {
        viewCoordinates.x -= viewMoveSpeed
    }

    if (e.code === 'ArrowRight') {
        viewCoordinates.x += viewMoveSpeed
    }
})