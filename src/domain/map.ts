import { Cell } from './coordinates'
import { Id, newId } from './id'
import { EMPTY_METATILE_ID, LedgeDirection, metatileById, Metatile, MetatileId, Tileset } from './tileset'

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

    /** A one-way edge, or null. Stored since T-022; movement enforces it in T-028. */
    ledge: (LedgeDirection | null)[]
}

/** One cell's attributes as the editor shows and paints them. */
export type CellAttributes = {
    readonly solid: boolean

    readonly elevation: number

    readonly ledge: LedgeDirection | null
}

/** The largest elevation the editor offers. Gen 3 maps use a handful of levels. */
export const MAX_ELEVATION = 15

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
        ledge: new Array<LedgeDirection | null>(cells).fill(null),
    }
}

/** Fills attribute arrays an older file lacks; the grid itself is untouched. */
export function withTileMapDefaults(map: TileMap): TileMap {
    const cells = map.width * map.height
    const ledge = map.attributes.ledge

    if (Array.isArray(ledge) && ledge.length === cells) {
        return map
    }

    return { ...map, attributes: { ...map.attributes, ledge: new Array<LedgeDirection | null>(cells).fill(null) } }
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

/** A copy of a dense cell array with one cell set, or the same array when the cell is outside. */
export function withCell<T>(map: GridSize, cells: readonly T[], cell: Cell, value: T): T[] {
    const index = cellIndex(map, cell)

    if (index === undefined || cells[index] === value) {
        return [...cells]
    }

    const next = [...cells]

    next[index] = value

    return next
}

/** A copy of a dense cell array with every cell in the rectangle `a`..`b` (inclusive) set to `value`. */
export function withCellsRect<T>(map: GridSize, cells: readonly T[], a: Cell, b: Cell, value: T): T[] {
    const span = cellSpan(map, a, b)
    const next = [...cells]

    for (let y = span.minY; y <= span.maxY; y++) {
        for (let x = span.minX; x <= span.maxX; x++) {
            next[y * map.width + x] = value
        }
    }

    return next
}

/**
 * Flood fill on a dense cell array: every cell 4-connected to `start` that
 * shares its value becomes `value`. Bounded by the map, never by a view.
 * Filling with the value already there, or from outside, returns a copy.
 */
export function floodFillCells<T>(map: GridSize, cells: readonly T[], start: Cell, value: T, empty: T): T[] {
    const startIndex = cellIndex(map, start)
    const next = [...cells]

    if (startIndex === undefined) {
        return next
    }

    const target = cells[startIndex] ?? empty

    if (target === value) {
        return next
    }

    const stack: number[] = [startIndex]

    while (stack.length > 0) {
        const index = stack.pop()

        if (index === undefined || (next[index] ?? empty) !== target) {
            continue
        }

        next[index] = value

        const x = index % map.width
        const y = Math.floor(index / map.width)

        if (x > 0) stack.push(index - 1)
        if (x < map.width - 1) stack.push(index + 1)
        if (y > 0) stack.push(index - map.width)
        if (y < map.height - 1) stack.push(index + map.width)
    }

    return next
}

/** A new layer with every cell in the rectangle `a`..`b` (inclusive) set to `id`. */
export function withRect(map: GridSize, layer: TileLayer, a: Cell, b: Cell, id: MetatileId): TileLayer {
    return { ...layer, tiles: withCellsRect(map, layer.tiles, a, b, id) }
}

/**
 * Flood fill on ids. A fill with the id the region already has, or from
 * outside the map, returns the layer unchanged.
 */
export function floodFill(map: GridSize, layer: TileLayer, start: Cell, id: MetatileId): TileLayer {
    const startIndex = cellIndex(map, start)

    if (startIndex === undefined || (layer.tiles[startIndex] ?? EMPTY_METATILE_ID) === id) {
        return layer
    }

    return { ...layer, tiles: floodFillCells(map, layer.tiles, start, id, EMPTY_METATILE_ID) }
}

/** The painted attributes at `cell`; outside the map everything is the default. */
export function attributesAt(map: TileMap, cell: Cell): CellAttributes {
    const index = cellIndex(map, cell)

    if (index === undefined) {
        return { solid: false, elevation: 0, ledge: null }
    }

    return {
        solid: (map.attributes.collision[index] ?? 0) !== 0,
        elevation: map.attributes.elevation[index] ?? 0,
        ledge: map.attributes.ledge[index] ?? null,
    }
}

/** A new map with the painted collision replaced. The picture layers are untouched. */
export function withCollision(map: TileMap, collision: number[]): TileMap {
    return { ...map, attributes: { ...map.attributes, collision } }
}

export function withElevation(map: TileMap, elevation: number[]): TileMap {
    return { ...map, attributes: { ...map.attributes, elevation } }
}

export function withLedge(map: TileMap, ledge: (LedgeDirection | null)[]): TileMap {
    return { ...map, attributes: { ...map.attributes, ledge } }
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

function isLedgeValue(value: unknown): value is LedgeDirection | null {
    return value === null || value === 'up' || value === 'down' || value === 'left' || value === 'right'
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
        && Array.isArray(attributes.ledge)
        && attributes.ledge.length === cells
        && attributes.ledge.every(isLedgeValue)
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
