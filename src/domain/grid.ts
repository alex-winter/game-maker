import { Cell, Coordinates } from './coordinates'

/** The side of one cell in pixels. See docs/decisions/0001-tile-grid.md. */
export const GRID_SIZE = 16

/** Floors `value` to the nearest multiple of `size` at or below it. */
export const snap = (size: number) => (value: number): number => {
    return Math.floor(value / size) * size
}

/** Floors a pixel position to the origin of the cell that contains it. */
export const snapToGrid = snap(GRID_SIZE)

/** The cell that contains a pixel position. */
export function pixelToCell(pixel: Coordinates): Cell {
    return {
        x: Math.floor(pixel.x / GRID_SIZE),
        y: Math.floor(pixel.y / GRID_SIZE),
    }
}

/** The top-left pixel of a cell. */
export function cellToPixel(cell: Cell): Coordinates {
    return {
        x: cell.x * GRID_SIZE,
        y: cell.y * GRID_SIZE,
    }
}
