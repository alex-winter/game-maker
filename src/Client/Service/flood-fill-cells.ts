import { Coordinates } from 'domain/coordinates'

/** Half-open pixel bounds of the cells that may be filled: `min <= cell < max`. */
export type CellBounds = {
    readonly minX: number

    readonly minY: number

    readonly maxX: number

    readonly maxY: number
}

/**
 * The 4-connected cells, starting at `start`, that share the start cell's image.
 * `imageAt` answers `undefined` for an empty cell. Cells are visited in steps of `step`.
 */
export function floodFillCells(
    start: Coordinates,
    bounds: CellBounds,
    step: number,
    imageAt: (cell: Coordinates) => string | undefined,
): Coordinates[] {
    const target = imageAt(start)
    const visited = new Set<string>()
    const queue: Coordinates[] = [start]
    const cells: Coordinates[] = []

    const isInBounds = (cell: Coordinates): boolean =>
        cell.x >= bounds.minX && cell.x < bounds.maxX && cell.y >= bounds.minY && cell.y < bounds.maxY

    while (queue.length > 0) {
        const cell = queue.pop()

        if (cell === undefined) {
            break
        }

        const key = `${cell.x},${cell.y}`

        if (visited.has(key) || !isInBounds(cell)) {
            continue
        }

        visited.add(key)

        if (imageAt(cell) !== target) {
            continue
        }

        cells.push(cell)

        queue.push(
            { x: cell.x - step, y: cell.y },
            { x: cell.x + step, y: cell.y },
            { x: cell.x, y: cell.y - step },
            { x: cell.x, y: cell.y + step },
        )
    }

    return cells
}
