import { Cell } from './coordinates'
import { Direction, neighbour } from './movement'

/** Whether a cell stops a trainer's line of sight (and their walk): a wall, a ledge, a thing, or another person. */
export type BlocksSight = (from: Cell, to: Cell) => boolean

/**
 * The cells a trainer standing on `from` sees looking `facing`: a straight
 * line up to `range` cells, cut short at the first cell `blocked` refuses.
 */
export function lineOfSight(from: Cell, facing: Direction, range: number, blocked: BlocksSight): Cell[] {
    const cells: Cell[] = []
    let previous = from

    for (let step = 0; step < range; step++) {
        const next = neighbour(previous, facing)

        if (blocked(previous, next)) {
            break
        }

        cells.push(next)
        previous = next
    }

    return cells
}

/** True when `target` stands somewhere along the trainer's line of sight. */
export function sees(from: Cell, facing: Direction, range: number, target: Cell, blocked: BlocksSight): boolean {
    return lineOfSight(from, facing, range, blocked).some(cell => cell.x === target.x && cell.y === target.y)
}
