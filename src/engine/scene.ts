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

/** A source rectangle on a decoded sheet: one animation frame. */
export type SpriteFrame<TImage> = {
    readonly image: TImage

    readonly sx: number

    readonly sy: number

    readonly sw: number

    readonly sh: number
}

/**
 * Something that stands on the map and is drawn between the ground and
 * overhead passes. Until it has a sprite it is a filled rectangle.
 */
export type Actor<TImage> = Rect & {
    readonly sprite?: SpriteFrame<TImage>

    /** The stand-in colour when there is no sprite. */
    readonly color: string
}

/**
 * Everything a frame needs, with pictures already decoded. Hosts build one
 * when the map or its images change, not every frame; actors move every
 * frame, so hosts pass them to `renderFrame` separately.
 */
export type Scene<TImage> = {
    readonly tileMap: TileMap

    readonly tileset: Tileset | undefined

    /** The decoded sheet a metatile cuts from, by sheet id. */
    readonly sheetById: ReadonlyMap<Id, TImage>

    readonly placementLayers: readonly PlacementLayer<TImage>[]
}
