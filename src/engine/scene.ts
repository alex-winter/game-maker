import { Rect } from '../domain/coordinates'
import { Id } from '../domain/id'
import { TileMap } from '../domain/map'
import { Tileset } from '../domain/tileset'

/** A decoded legacy placement: one picture at one pixel position. Read-only since T-020. */
export type PlacedImage<TImage> = Rect & {
    readonly image: TImage
}

/** One legacy placement layer, sorted back to front. Drawn as a frozen background under the tile layers. */
export type PlacementLayer<TImage> = {
    readonly placements: readonly PlacedImage<TImage>[]
}

/**
 * Everything a frame needs, with pictures already decoded. Hosts build one
 * when the map or its images change, not every frame.
 */
export type Scene<TImage> = {
    readonly tileMap: TileMap

    readonly tileset: Tileset | undefined

    /** The decoded sheet a metatile cuts from, by sheet id. */
    readonly sheetById: ReadonlyMap<Id, TImage>

    readonly placementLayers: readonly PlacementLayer<TImage>[]
}
