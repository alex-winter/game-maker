import { Coordinates, Rect } from './coordinates'
import { GRID_SIZE } from './grid'
import { Id, newId } from './id'

/** A metatile id inside one tileset. `EMPTY_METATILE_ID` is "nothing here". */
export type MetatileId = number

export const EMPTY_METATILE_ID: MetatileId = 0

export type LedgeDirection = 'up' | 'down' | 'left' | 'right'

/**
 * Extra pictures a metatile cycles through (T-045): where each later frame
 * sits on the same sheet (same size as the metatile) and how long every
 * frame shows. The metatile's own rectangle is frame 0.
 */
export type TileAnimation = {
    readonly frames: readonly Coordinates[]

    readonly frameMs: number
}

export const DEFAULT_FRAME_MS = 250

/**
 * One 16×16 cell picture plus its default attributes. Pixels are not stored
 * here; `sheetId` and the rectangle say where to cut them from the sheet.
 */
export type Metatile = {
    readonly id: MetatileId

    readonly sheetId: Id

    /** Source rectangle on the sheet, in pixels. */
    readonly x: number

    readonly y: number

    readonly w: number

    readonly h: number

    readonly solid: boolean

    /** 0 means "any elevation", the value used for stairs and doorways. */
    readonly elevation: number

    /** Set when the cell can only be crossed in this direction (a one-way ledge). */
    readonly ledge: LedgeDirection | null

    /** Absent for a tile that never changes. */
    readonly animation?: TileAnimation
}

export type Tileset = {
    readonly id: Id

    name: string

    metatiles: Metatile[]
}

export function metatileById(tileset: Tileset, id: MetatileId): Metatile | undefined {
    if (id === EMPTY_METATILE_ID) {
        return undefined
    }

    return tileset.metatiles.find(metatile => metatile.id === id)
}

/** The next free id in a tileset. Ids start at 1 because 0 is the empty cell. */
export function nextMetatileId(tileset: Tileset): MetatileId {
    return tileset.metatiles.reduce((max, metatile) => Math.max(max, metatile.id), EMPTY_METATILE_ID) + 1
}

/**
 * Cuts a sheet into 16×16 metatiles, row-major from the top-left, ids from 1.
 * A partial row or column at the edge is dropped. Nothing is solid yet.
 */
export function sliceSheet(name: string, sheetId: Id, widthPx: number, heightPx: number): Tileset {
    const columns = Math.floor(widthPx / GRID_SIZE)
    const rows = Math.floor(heightPx / GRID_SIZE)
    const metatiles: Metatile[] = []

    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            metatiles.push({
                id: row * columns + column + 1,
                sheetId,
                x: column * GRID_SIZE,
                y: row * GRID_SIZE,
                w: GRID_SIZE,
                h: GRID_SIZE,
                solid: false,
                elevation: 0,
                ledge: null,
            })
        }
    }

    return { id: newId(), name, metatiles }
}

/** The fields an author may set on a metatile; `animation: null` takes the animation away. */
export type MetatileAttributes = Pick<Metatile, 'solid' | 'elevation' | 'ledge'> & { readonly animation: TileAnimation | null }

/** A new tileset with one metatile's attributes changed. Unknown ids change nothing. */
export function withMetatileAttributes(
    tileset: Tileset,
    id: MetatileId,
    attributes: Partial<MetatileAttributes>,
): Tileset {
    const { animation, ...rest } = attributes

    return {
        ...tileset,
        metatiles: tileset.metatiles.map(metatile => {
            if (metatile.id !== id) {
                return metatile
            }

            const changed: Metatile = { ...metatile, ...rest }

            if (animation === undefined) {
                return changed
            }

            if (animation === null) {
                const { animation: _dropped, ...still } = changed

                return still
            }

            return { ...changed, animation }
        }),
    }
}

/** How many pictures a metatile cycles through: one for a still tile. */
export function frameCount(metatile: Metatile): number {
    return 1 + (metatile.animation?.frames.length ?? 0)
}

/**
 * The source rectangle to draw for `metatile` at `timeMs` on the session
 * clock: frame 0 for the first `frameMs`, frame 1 for the next, round and
 * round. A still tile is always its own rectangle.
 */
export function frameAt(metatile: Metatile, timeMs: number): Rect {
    const own: Rect = { x: metatile.x, y: metatile.y, width: metatile.w, height: metatile.h }

    if (metatile.animation === undefined || metatile.animation.frames.length === 0 || metatile.animation.frameMs <= 0) {
        return own
    }

    const index = Math.floor(Math.max(0, timeMs) / metatile.animation.frameMs) % frameCount(metatile)

    if (index === 0) {
        return own
    }

    const frame = metatile.animation.frames[index - 1]

    return { ...own, x: frame.x, y: frame.y }
}

/** The animation with one more frame at `frame`, or a fresh animation at `DEFAULT_FRAME_MS` for a still tile. */
export function withAddedFrame(metatile: Metatile, frame: Coordinates): TileAnimation {
    const animation = metatile.animation ?? { frames: [], frameMs: DEFAULT_FRAME_MS }

    return { ...animation, frames: [...animation.frames, frame] }
}

/** True for `{ frames: [{ x, y }...], frameMs > 0 }`. */
export function isTileAnimation(value: unknown): value is TileAnimation {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const record = value as { [key: string]: unknown }

    return Array.isArray(record.frames)
        && record.frames.every(frame => typeof frame === 'object' && frame !== null
            && typeof (frame as { x?: unknown }).x === 'number' && (frame as { x: number }).x >= 0
            && typeof (frame as { y?: unknown }).y === 'number' && (frame as { y: number }).y >= 0)
        && typeof record.frameMs === 'number' && Number.isInteger(record.frameMs) && record.frameMs > 0
}

const LEDGES: readonly (LedgeDirection | null)[] = [null, 'up', 'down', 'left', 'right']

function isLedge(value: unknown): value is LedgeDirection | null {
    return LEDGES.includes(value as LedgeDirection | null)
}

/** True for a body that only sets attribute fields with the right types. */
export function isMetatileAttributes(value: unknown): value is Partial<MetatileAttributes> {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const record = value as { [key: string]: unknown }

    return Object.keys(record).every(key => key === 'solid' || key === 'elevation' || key === 'ledge' || key === 'animation')
        && (record.solid === undefined || typeof record.solid === 'boolean')
        && (record.elevation === undefined || (typeof record.elevation === 'number' && Number.isInteger(record.elevation) && record.elevation >= 0))
        && (record.ledge === undefined || isLedge(record.ledge))
        && (record.animation === undefined || record.animation === null || isTileAnimation(record.animation))
}

function isMetatile(value: unknown): value is Metatile {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const record = value as { [key: string]: unknown }

    return typeof record.id === 'number' && record.id > EMPTY_METATILE_ID
        && typeof record.sheetId === 'string'
        && [record.x, record.y, record.w, record.h].every(n => typeof n === 'number' && n >= 0)
        && typeof record.solid === 'boolean'
        && typeof record.elevation === 'number'
        && isLedge(record.ledge)
        && (record.animation === undefined || isTileAnimation(record.animation))
}

/** True for a tileset body a client may store: a name and well-formed metatiles with unique ids. */
export function isTilesetInput(value: unknown): value is Pick<Tileset, 'name' | 'metatiles'> {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const record = value as { [key: string]: unknown }

    if (typeof record.name !== 'string' || record.name.trim() === '' || !Array.isArray(record.metatiles)) {
        return false
    }

    const ids = new Set(record.metatiles.map(metatile => (metatile as { id?: unknown }).id))

    return record.metatiles.every(isMetatile) && ids.size === record.metatiles.length
}
