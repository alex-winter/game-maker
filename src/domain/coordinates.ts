/** A position in pixels. Values may be fractional while a camera is moving. */
export type Coordinates = {
    x: number

    y: number
}

export type Dimensions = {
    width: number

    height: number
}

/** A pixel rectangle: `[x, x + width) × [y, y + height)`. */
export type Rect = Coordinates & Dimensions

/**
 * A position in cells. Both values are integers. Do not pass a `Cell`
 * where a pixel `Coordinates` is meant; convert through `domain/grid`.
 */
export type Cell = {
    readonly x: number

    readonly y: number
}

export function isCell(value: unknown): value is Cell {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const cell = value as { x?: unknown; y?: unknown }

    return Number.isInteger(cell.x) && Number.isInteger(cell.y)
}
