import { Id } from './id'

/** A metatile id inside one tileset. `EMPTY_METATILE_ID` is "nothing here". */
export type MetatileId = number

export const EMPTY_METATILE_ID: MetatileId = 0

export type LedgeDirection = 'up' | 'down' | 'left' | 'right'

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
