import { LoadedPlacement } from 'Client/Model/LoadedPlacement'
import { Id } from 'domain/id'
import { TileMap } from 'domain/map'
import { Tileset } from 'domain/tileset'
import { PlacementLayer, Scene } from 'engine/scene'
import { drawOrder } from 'Model/draw-order'
import { Layer } from 'Model/Layer'

export type SceneSources = {
    readonly tileMap: TileMap

    readonly tileset: Tileset | undefined

    readonly sheetById: ReadonlyMap<Id, CanvasImageSource>

    readonly layers: readonly Layer[]

    readonly loadedPlacements: readonly LoadedPlacement[]
}

/** Back first, so a later draw covers an earlier one: ascending drawOrder. */
export function sortBackToFront(layers: readonly Layer[]): Layer[] {
    return [...layers].sort((a, b) => drawOrder(a) - drawOrder(b))
}

/**
 * Turns the editor's and play page's state into what the engine draws.
 * Hidden layers are left out. Call it when something changed, not per frame.
 */
export function buildScene(sources: SceneSources): Scene<CanvasImageSource> {
    const placementLayers: PlacementLayer<CanvasImageSource>[] = sortBackToFront(sources.layers)
        .filter(layer => layer.is_visible)
        .map(layer => ({
            placements: sources.loadedPlacements.filter(placement => placement.layerUuid === layer.uuid),
        }))

    return {
        tileMap: sources.tileMap,
        tileset: sources.tileset,
        sheetById: sources.sheetById,
        placementLayers,
    }
}
