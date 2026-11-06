import { Cell, Coordinates } from './coordinates'
import { GRID_SIZE } from './grid'
import { GridSize, isInside } from './map'

export type Direction = 'up' | 'down' | 'left' | 'right'

/** Milliseconds to cross one cell at a walk. Gen 3 walks a cell in 16 frames at 60 Hz. */
export const WALK_MS_PER_CELL = 267

/** Milliseconds to cross one cell at a run: half the walk, as on the GBA. */
export const RUN_MS_PER_CELL = 133

/** A step from one cell to the next, measured in time so frame rate does not matter. */
export type Step = {
    readonly from: Cell

    readonly to: Cell

    readonly durationMs: number

    readonly elapsedMs: number
}

/**
 * The player on the field. `cell` is where they stand, or where the current
 * step started; `step` is null while they stand still.
 */
export type Player = {
    readonly cell: Cell

    readonly facing: Direction

    readonly step: Step | null
}

/** What the host read from its input device this frame. The domain never touches the keyboard. */
export type MovementInput = {
    readonly direction: Direction | null

    readonly running: boolean
}

/** Whether a step may enter `to` from `from`. T-026 knows only the map edge; T-028 adds collision. */
export type CanEnter = (from: Cell, to: Cell) => boolean

export const DIRECTION_DELTAS: { readonly [D in Direction]: Cell } = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
}

export function neighbour(cell: Cell, direction: Direction): Cell {
    const delta = DIRECTION_DELTAS[direction]

    return { x: cell.x + delta.x, y: cell.y + delta.y }
}

export function newPlayer(cell: Cell, facing: Direction = 'down'): Player {
    return { cell, facing, step: null }
}

/** The rule that only keeps the player on the grid. */
export const insideMap = (size: GridSize): CanEnter => (_from, to) => isInside(size, to)

/** Turns to face `direction` and starts a step if the next cell may be entered. Standing still otherwise. */
export function beginStep(player: Player, direction: Direction, durationMs: number, canEnter: CanEnter): Player {
    const faced: Player = player.facing === direction ? player : { ...player, facing: direction }

    if (faced.step !== null) {
        return faced
    }

    const to = neighbour(faced.cell, direction)

    if (!canEnter(faced.cell, to)) {
        return faced
    }

    return { ...faced, step: { from: faced.cell, to, durationMs, elapsedMs: 0 } }
}

/**
 * Moves the current step on by `deltaMs`. When the step completes the player
 * stands on `to`; any leftover time is dropped, so a step never overshoots.
 */
export function advanceStep(player: Player, deltaMs: number): Player {
    if (player.step === null) {
        return player
    }

    const elapsedMs = player.step.elapsedMs + deltaMs

    if (elapsedMs < player.step.durationMs) {
        return { ...player, step: { ...player.step, elapsedMs } }
    }

    return { ...player, cell: player.step.to, step: null }
}

/**
 * One frame of movement: finish or continue the step in progress, then,
 * if a direction is held and the player is standing, begin the next step.
 * Holding a key therefore walks cell to cell with no gap between steps.
 */
export function stepPlayer(player: Player, input: MovementInput, deltaMs: number, canEnter: CanEnter): Player {
    const advanced = advanceStep(player, deltaMs)

    if (input.direction === null) {
        return advanced
    }

    return beginStep(advanced, input.direction, input.running ? RUN_MS_PER_CELL : WALK_MS_PER_CELL, canEnter)
}

/** Where the player stands, or will stand when the step in progress lands. */
export function restingCell(player: Player): Cell {
    return player.step === null ? player.cell : player.step.to
}

/** How far through the current step the player is, 0 to 1; 0 when standing. */
export function stepProgress(player: Player): number {
    return player.step === null ? 0 : player.step.elapsedMs / player.step.durationMs
}

/** The player's top-left pixel, interpolated along the step in progress. */
export function playerPixel(player: Player): Coordinates {
    const t = stepProgress(player)
    const from = player.step === null ? player.cell : player.step.from
    const to = player.step === null ? player.cell : player.step.to

    return {
        x: (from.x + (to.x - from.x) * t) * GRID_SIZE,
        y: (from.y + (to.y - from.y) * t) * GRID_SIZE,
    }
}

const DIRECTIONS: readonly Direction[] = ['up', 'down', 'left', 'right']

export function isDirection(value: unknown): value is Direction {
    return DIRECTIONS.includes(value as Direction)
}
