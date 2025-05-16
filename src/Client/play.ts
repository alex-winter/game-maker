import { LayerRepository } from 'Client/Service/Repository/LayerRepository'
import './play.css'
import { Dom } from 'Client/Service/Dom'
import { placementImageRepository } from 'Client/Service/Repository/PlacementImageRepository'
import { LoadedPlacement } from 'Client/Model/LoadedPlacement'
import { Coordinate } from 'Client/Model/Coordinate'

const layerRepository = new LayerRepository()

const viewCoordinates: Coordinate = {
    x: 0,
    y: 0,
}

const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
}

function renderLayers(
    ctx: CanvasRenderingContext2D,
    loadedPlacements: LoadedPlacement[],
    width: number,
    height: number,
): void {
    setTimeout(
        () => {
            ctx.clearRect(0, 0, width, height)

            loadedPlacements.forEach(loadedPlacement => {
                ctx.drawImage(
                    loadedPlacement.image,
                    (loadedPlacement.x - viewCoordinates.x),
                    (loadedPlacement.y - viewCoordinates.y),
                    loadedPlacement.image.width,
                    loadedPlacement.image.height,
                )
            })

            window.requestAnimationFrame(() => renderLayers(ctx, loadedPlacements, width, height))
        },
        80,
    )
}


document.addEventListener('DOMContentLoaded', async () => {
    const loadedPlacements: LoadedPlacement[] = []

    const canvas = document.querySelector('canvas')!
    const ctx = canvas.getContext('2d')!

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight


    const layers = await layerRepository.getAll()

    layers.forEach(layer => {
        layer.placements.forEach(async placement => {
            const placementImage = await placementImageRepository.getByUuid(
                placement.imageUuid
            )

            if (!placementImage) {
                throw new Error('could not find placement image')
            }

            loadedPlacements.push({
                image: await Dom.image(
                    placementImage.src
                ),
                x: placement.coordinate.x,
                y: placement.coordinate.y,
            })
        })
    })

    renderLayers(ctx, loadedPlacements, canvas.width, canvas.height)

})



window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.code === 'ArrowUp') {
        viewCoordinates.y -= 1
    }

    if (e.code === 'ArrowDown') {
        viewCoordinates.y += 1
    }

    if (e.code === 'ArrowLeft') {
        viewCoordinates.x -= 1
    }

    if (e.code === 'ArrowRight') {
        viewCoordinates.x += 1
    }
})