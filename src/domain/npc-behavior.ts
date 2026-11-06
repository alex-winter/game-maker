import { Cell } from './coordinates'
import { Id } from './id'
import { advanceStep, beginStep, CanEnter, Direction, newPlayer, Player, WALK_MS_PER_CELL } from './movement'
import { NpcBehavior, NpcEvent } from './warp'

/** A source of numbers in [0, 1). Hosts pass `Math.random`; tests pass a fixed sequence. */
export type Random = () => number

/** How long a person waits between turns or steps, at the shortest and the longest. */
export const MIN_PAUSE_MS = 1000

export const MAX_PAUSE_MS = 2500

/** A wanderer never strays more than this many cells from where they were placed, on either axis. */
export const WANDER_RADIUS = 2

/** A person in motion: where they were placed, where they are now (a `Player`-shaped mover), and how long until they act again. */
export type NpcMotion = {
    readonly eventId: Id

    readonly home: Cell

    readonly mover: Player

    readonly pauseMs: number
}

const DIRECTIONS: readonly Direction[] = ['up', 'down', 'left', 'right']

export function newNpcMotion(npc: NpcEvent): NpcMotion {
    return { eventId: npc.id, home: npc.cell, mover: newPlayer(npc.cell, npc.facing), pauseMs: MIN_PAUSE_MS }
}

/** One of the four directions, picked by `random`. */
export function pickDirection(random: Random): Direction {
    const index = Math.min(DIRECTIONS.length - 1, Math.max(0, Math.floor(random() * DIRECTIONS.length)))

    return DIRECTIONS[index]
}

/** A pause between `MIN_PAUSE_MS` and `MAX_PAUSE_MS`, picked by `random`. */
export function nextPause(random: Random): number {
    return MIN_PAUSE_MS + Math.floor(random() * (MAX_PAUSE_MS - MIN_PAUSE_MS))
}

/** Whether `cell` lies within the wander radius of `home`. */
export function withinLeash(home: Cell, cell: Cell): boolean {
    return Math.abs(cell.x - home.x) <= WANDER_RADIUS && Math.abs(cell.y - home.y) <= WANDER_RADIUS
}

/** Only `advanceStep`: a person mid-step finishes it while the field is paused, and a standing one waits. */
export function finishStep(motion: NpcMotion, deltaMs: number): NpcMotion {
    return motion.mover.step === null ? motion : { ...motion, mover: advanceStep(motion.mover, deltaMs) }
}

/**
 * One frame of a person's behavior. A step in progress runs on; a standing
 * person waits out their pause, then `look` turns to a random direction and
 * `wander` tries a step that way — refused by `canEnter` (or the leash) it
 * only turns, like looking at the wall. `still` does nothing.
 */
export function tickNpcMotion(motion: NpcMotion, behavior: NpcBehavior, deltaMs: number, canEnter: CanEnter, random: Random): NpcMotion {
    const mover = advanceStep(motion.mover, deltaMs)

    if (mover.step !== null || behavior === 'still') {
        return { ...motion, mover }
    }

    const pauseMs = motion.pauseMs - deltaMs

    if (pauseMs > 0) {
        return { ...motion, mover, pauseMs }
    }

    const direction = pickDirection(random)

    if (behavior === 'look') {
        return { ...motion, mover: { ...mover, facing: direction }, pauseMs: nextPause(random) }
    }

    const leashed: CanEnter = (from, to) => withinLeash(motion.home, to) && canEnter(from, to)

    return { ...motion, mover: beginStep(mover, direction, WALK_MS_PER_CELL, leashed), pauseMs: nextPause(random) }
}
