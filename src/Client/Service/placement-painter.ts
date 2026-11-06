import { LoadedPlacement } from 'Client/Model/LoadedPlacement'
import { CellBounds, floodFillCells } from 'Client/Service/flood-fill-cells'
import { loadPlacement } from 'Client/Service/load-placement'
import { loadedPlacementRepository } from 'Client/Service/Repository/LoadedPlacement'
import { Coordinates } from 'domain/coordinates'
import { GRID_SIZE } from 'domain/grid'
import { rectContainsPoint } from 'domain/rect'
import { Layer } from 'Model/Layer'
import { ImagePlacement } from 'Model/Placement'

/**
 * Pencil, fill, and rubber on the legacy placement model. Each function
 * mutates `layer.placements` and the loaded-placement cache together; the
 * caller persists the layer when the stroke ends. Retired by T-020.
 */

function loadedPlacementsOf(layer: Layer): LoadedPlacement[] {
    return loadedPlacementRepository.get()
        .filter(loadedPlacement => loadedPlacement.layerUuid === layer.uuid)
}

/** The front-most loaded placement whose rectangle covers `cell`. */
export function placementCovering(layer: Layer, cell: Coordinates): LoadedPlacement | undefined {
    const covering = loadedPlacementsOf(layer)
        .filter(loadedPlacement => rectContainsPoint(loadedPlacement, cell))

    return covering[covering.length - 1]
}

export function imageUuidAt(layer: Layer, cell: Coordinates): string | undefined {
    const covering = placementCovering(layer, cell)

    if (covering === undefined) {
        return undefined
    }

    return layer.placements.find(p => p.uuid === covering.uuid)?.imageUuid
}

/** One placement at one cell. Pencil and fill both end here. */
export function stamp(layer: Layer, cell: Coordinates, imageUuid: string): Promise<void> {
    const placement: ImagePlacement = {
        uuid: crypto.randomUUID(),
        coordinate: { x: cell.x, y: cell.y },
        imageUuid,
    }

    layer.placements.push(placement)

    return loadPlacement(placement, layer.uuid)
}

/** Stamps unless the last stroke step already put the same image on this cell. */
export async function pencil(layer: Layer, cell: Coordinates, imageUuid: string): Promise<void> {
    const lastPlacement = layer.placements[layer.placements.length - 1]

    if (
        lastPlacement
        && lastPlacement.coordinate.x === cell.x
        && lastPlacement.coordinate.y === cell.y
        && lastPlacement.imageUuid === imageUuid
    ) {
        return
    }

    await stamp(layer, cell, imageUuid)
}

export function erase(layer: Layer, cell: Coordinates): void {
    const covering = placementCovering(layer, cell)

    if (covering === undefined) {
        return
    }

    const index = layer.placements.findIndex(p => p.uuid === covering.uuid)

    if (index !== -1) {
        layer.placements.splice(index, 1)
    }

    loadedPlacementRepository.removeByUuid(covering.uuid)
}

/** Replaces every connected cell that matches the clicked one with one placement per cell. */
export async function fill(
    layer: Layer,
    start: Coordinates,
    imageUuid: string,
    bounds: CellBounds,
): Promise<boolean> {
    if (imageUuidAt(layer, start) === imageUuid) {
        return false
    }

    const cells = floodFillCells(start, bounds, GRID_SIZE, cell => imageUuidAt(layer, cell))

    if (cells.length === 0) {
        return false
    }

    for (const cell of cells) {
        erase(layer, cell)
    }

    await Promise.all(cells.map(cell => stamp(layer, cell, imageUuid)))

    return true
}
