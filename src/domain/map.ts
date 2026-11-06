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

/** The inclusive cell rectangle spanned by two corners, clamped to the grid. */
function cellSpan(map: GridSize, a: Cell, b: Cell) {
    return {
        minX: Math.max(0, Math.min(a.x, b.x)),
        minY: Math.max(0, Math.min(a.y, b.y)),
        maxX: Math.min(map.width - 1, Math.max(a.x, b.x)),
        maxY: Math.min(map.height - 1, Math.max(a.y, b.y)),
    }
}

/** A new layer with every cell in the rectangle `a`..`b` (inclusive) set to `id`. */
export function withRect(map: GridSize, layer: TileLayer, a: Cell, b: Cell, id: MetatileId): TileLayer {
    const span = cellSpan(map, a, b)
    const tiles = [...layer.tiles]

    for (let y = span.minY; y <= span.maxY; y++) {
        for (let x = span.minX; x <= span.maxX; x++) {
            tiles[y * map.width + x] = id
        }
    }

    return { ...layer, tiles }
}

/**
 * Flood fill on ids: every cell 4-connected to `start` that shares its id
 * becomes `id`. Bounded by the map, never by a view. A fill with the id the
 * region already has, or from outside the map, returns the layer unchanged.
 */
export function floodFill(map: GridSize, layer: TileLayer, start: Cell, id: MetatileId): TileLayer {
    const startIndex = cellIndex(map, start)

    if (startIndex === undefined) {
        return layer
    }

    const target = layer.tiles[startIndex] ?? EMPTY_METATILE_ID

    if (target === id) {
        return layer
    }

    const tiles = [...layer.tiles]
    const stack: number[] = [startIndex]

    while (stack.length > 0) {
        const index = stack.pop()

        if (index === undefined || tiles[index] !== target) {
            continue
        }

        tiles[index] = id

        const x = index % map.width
        const y = Math.floor(index / map.width)

        if (x > 0) stack.push(index - 1)
        if (x < map.width - 1) stack.push(index + 1)
        if (y > 0) stack.push(index - map.width)
        if (y < map.height - 1) stack.push(index + map.width)
    }

    return { ...layer, tiles }
}

export function findTileLayer(map: TileMap, layerId: Id): TileLayer | undefined {
    return map.layers.find(layer => layer.id === layerId)
}

/** A new map with the layer of the same id replaced. Unknown ids leave the map unchanged. */
export function withTileLayer(map: TileMap, layer: TileLayer): TileMap {
    return { ...map, layers: map.layers.map(existing => existing.id === layer.id ? layer : existing) }
}

/** A new map with an empty layer appended at the front. */
export function addTileLayer(map: TileMap, name: string, kind: TileLayerKind): TileMap {
    return { ...map, layers: [...map.layers, emptyTileLayer(name, kind, map)] }
}

/** A new map without the layer. The last layer cannot be removed. */
export function removeTileLayer(map: TileMap, layerId: Id): TileMap {
    if (map.layers.length <= 1) {
        return map
    }

    return { ...map, layers: map.layers.filter(layer => layer.id !== layerId) }
}

export function renameTileLayer(map: TileMap, layerId: Id, name: string): TileMap {
    const layer = findTileLayer(map, layerId)

    return layer === undefined ? map : withTileLayer(map, { ...layer, name })
}

/** Moves a layer one step toward the back (`-1`) or the front (`+1`). */
export function moveTileLayer(map: TileMap, layerId: Id, delta: -1 | 1): TileMap {
    const from = map.layers.findIndex(layer => layer.id === layerId)
    const to = from + delta

    if (from === -1 || to < 0 || to >= map.layers.length) {
        return map
    }

    const layers = [...map.layers]
    const moved = layers[from]

    layers[from] = layers[to]
    layers[to] = moved

    return { ...map, layers }
}

function isNonNegativeInteger(value: unknown): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

function isTileLayer(value: unknown, cells: number): value is TileLayer {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const layer = value as Partial<TileLayer>

    return typeof layer.id === 'string'
        && typeof layer.name === 'string'
        && (layer.kind === 'ground' || layer.kind === 'overhead')
        && Array.isArray(layer.tiles)
        && layer.tiles.length === cells
        && layer.tiles.every(isNonNegativeInteger)
}

/** A structurally sound tile map: positive size, every array as long as the grid, ids non-negative integers. */
export function isTileMap(value: unknown): value is TileMap {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const map = value as Partial<TileMap>

    if (!isNonNegativeInteger(map.width) || !isNonNegativeInteger(map.height) || map.width === 0 || map.height === 0) {
        return false
    }

    const cells = map.width * map.height
    const attributes = map.attributes

    return (map.tilesetId === null || typeof map.tilesetId === 'string')
        && Array.isArray(map.layers)
        && map.layers.length > 0
        && map.layers.every(layer => isTileLayer(layer, cells))
        && typeof attributes === 'object'
        && attributes !== null
        && Array.isArray(attributes.collision)
        && attributes.collision.length === cells
        && attributes.collision.every(isNonNegativeInteger)
        && Array.isArray(attributes.elevation)
        && attributes.elevation.length === cells
        && attributes.elevation.every(isNonNegativeInteger)
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
