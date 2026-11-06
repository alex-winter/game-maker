import { Cell } from './coordinates'
import { Id, newId } from './id'
import { EMPTY_METATILE_ID, metatileById, Metatile, MetatileId, Tileset } from './tileset'

/** A size in cells. */
export type GridSize = {
    readonly width: number

    readonly height: number
}

/** Ground layers draw under actors; overhead layers draw over them. */
export type TileLayerKind = 'ground' | 'overhead'

/** A dense, row-major grid of metatile ids: `tiles[y * width + x]`. */
export type TileLayer = {
    readonly id: Id

    name: string

    kind: TileLayerKind

    tiles: MetatileId[]
}

/** Per-cell data that is not a picture, on the same index math as a tile layer. */
export type AttributeLayer = {
    /** 1 blocks movement, 0 does not. Painted on top of the metatile defaults. */
    collision: number[]

    /** 0 means "use the metatile's elevation". */
    elevation: number[]
}

/** The grid half of a map. Layers are listed back to front. */
export type TileMap = GridSize & {
    tilesetId: Id | null

    layers: TileLayer[]

    attributes: AttributeLayer
}

export function emptyTileLayer(name: string, kind: TileLayerKind, size: GridSize): TileLayer {
    return {
        id: newId(),
        name,
        kind,
        tiles: new Array<MetatileId>(size.width * size.height).fill(EMPTY_METATILE_ID),
    }
}

export function emptyAttributeLayer(size: GridSize): AttributeLayer {
    const cells = size.width * size.height

    return {
        collision: new Array<number>(cells).fill(0),
        elevation: new Array<number>(cells).fill(0),
    }
}

/** A map with one ground layer and one overhead layer, nothing painted. */
export function emptyTileMap(size: GridSize): TileMap {
    return {
        width: size.width,
        height: size.height,
        tilesetId: null,
        layers: [
            emptyTileLayer('Ground', 'ground', size),
            emptyTileLayer('Overhead', 'overhead', size),
        ],
        attributes: emptyAttributeLayer(size),
    }
}

export function isInside(size: GridSize, cell: Cell): boolean {
    return cell.x >= 0 && cell.y >= 0 && cell.x < size.width && cell.y < size.height
}

/** The array index of `cell`, or undefined when the cell is outside the grid. */
export function cellIndex(size: GridSize, cell: Cell): number | undefined {
    if (!isInside(size, cell)) {
        return undefined
    }

    return cell.y * size.width + cell.x
}

export function metatileIdAt(map: GridSize, layer: TileLayer, cell: Cell): MetatileId {
    const index = cellIndex(map, cell)

    return index === undefined ? EMPTY_METATILE_ID : layer.tiles[index] ?? EMPTY_METATILE_ID
}

/** The metatile a layer shows at `cell`, or undefined when the cell is empty or outside. */
export function metatileAt(
    map: GridSize,
    layer: TileLayer,
    tileset: Tileset,
    cell: Cell,
): Metatile | undefined {
    return metatileById(tileset, metatileIdAt(map, layer, cell))
}

/** A new layer with one cell set. The input layer is not mutated. */
export function withTile(map: GridSize, layer: TileLayer, cell: Cell, id: MetatileId): TileLayer {
    const index = cellIndex(map, cell)

    if (index === undefined) {
        return layer
    }

    const tiles = [...layer.tiles]

    tiles[index] = id

    return { ...layer, tiles }
}

/** Every metatile stacked at `cell`, back to front, skipping empty cells. */
function metatilesAt(map: TileMap, tileset: Tileset, cell: Cell): Metatile[] {
    const stacked: Metatile[] = []

    for (const layer of map.layers) {
        const metatile = metatileAt(map, layer, tileset, cell)

        if (metatile !== undefined) {
            stacked.push(metatile)
        }
    }

    return stacked
}

/**
 * The elevation of a cell: the painted attribute when it is set, else the
 * front-most metatile's elevation, else 0 ("any").
 */
export function elevationAt(map: TileMap, tileset: Tileset, cell: Cell): number {
    const index = cellIndex(map, cell)

    if (index === undefined) {
        return 0
    }

    const painted = map.attributes.elevation[index] ?? 0

    if (painted !== 0) {
        return painted
    }

    const stacked = metatilesAt(map, tileset, cell)

    return stacked.length === 0 ? 0 : stacked[stacked.length - 1].elevation
}

/** True when the cell itself cannot be stood on: outside the map, painted solid, or any solid metatile. */
export function isSolid(map: TileMap, tileset: Tileset, cell: Cell): boolean {
    const index = cellIndex(map, cell)

    if (index === undefined) {
        return true
    }

    if ((map.attributes.collision[index] ?? 0) !== 0) {
        return true
    }

    return metatilesAt(map, tileset, cell).some(metatile => metatile.solid)
}

/** Two elevations agree when they match or either one is 0 ("any"). */
export function elevationsAgree(a: number, b: number): boolean {
    return a === 0 || b === 0 || a === b
}

/**
 * Whether a step onto `to` is blocked. Without `from` only the destination
 * is examined. With `from`, a change of non-zero elevation also blocks.
 */
export function isBlocked(map: TileMap, tileset: Tileset, to: Cell, from?: Cell): boolean {
    if (isSolid(map, tileset, to)) {
        return true
    }

    if (from === undefined) {
        return false
    }

    return !elevationsAgree(elevationAt(map, tileset, from), elevationAt(map, tileset, to))
}
