import { Cell, isCell } from './coordinates'
import { Id } from './id'
import { Direction, isDirection, Player } from './movement'

/**
 * A door, stairs, or hole: stepping onto `cell` puts the player on another
 * map's cell, facing `facing`. The picture of the door is just a metatile.
 */
export type Warp = {
    readonly kind: 'warp'

    readonly id: Id

    cell: Cell

    toMapId: Id

    toCell: Cell

    facing: Direction
}

/** Something placed on a map cell that is not a tile. Warps now; NPCs join in T-042. */
export type MapEvent = Warp

export function newWarp(id: Id, cell: Cell, toMapId: Id, toCell: Cell, facing: Direction): Warp {
    return { kind: 'warp', id, cell, toMapId, toCell, facing }
}

export function sameCell(a: Cell, b: Cell): boolean {
    return a.x === b.x && a.y === b.y
}

/** The warp on a cell, or undefined. */
export function warpAt(events: readonly MapEvent[], cell: Cell): Warp | undefined {
    return events.find((event): event is Warp => event.kind === 'warp' && sameCell(event.cell, cell))
}

/** The events with one added or, when `event.id` already exists, replaced. One warp per cell: another warp on the same cell is dropped. */
export function withEvent(events: readonly MapEvent[], event: MapEvent): MapEvent[] {
    const kept = events.filter(existing => existing.id !== event.id && !(existing.kind === 'warp' && sameCell(existing.cell, event.cell)))

    return [...kept, event]
}

export function withoutEvent(events: readonly MapEvent[], eventId: Id): MapEvent[] {
    return events.filter(event => event.id !== eventId)
}

/**
 * True when the step in progress in `before` completed by `after`: the
 * player's cell is now where that step was going. Holds even if a held key
 * has already begun the next step from there.
 */
export function stepFinished(before: Player, after: Player): boolean {
    return before.step !== null && sameCell(after.cell, before.step.to)
}

/**
 * The warp the player just took, if any. A warp fires only when a step
 * finishes on its cell. Standing there already — having spawned or arrived
 * on it — does not fire, so a return warp cannot bounce the player back.
 */
export function warpTaken(before: Player, after: Player, events: readonly MapEvent[]): Warp | undefined {
    return stepFinished(before, after) ? warpAt(events, after.cell) : undefined
}

function isWarp(value: unknown): value is Warp {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const warp = value as { [K in keyof Warp]?: unknown }

    return warp.kind === 'warp'
        && typeof warp.id === 'string'
        && isCell(warp.cell)
        && typeof warp.toMapId === 'string'
        && isCell(warp.toCell)
        && isDirection(warp.facing)
}

/** Structural check for a map's whole event list as the editor sends it. */
export function isMapEvents(value: unknown): value is MapEvent[] {
    return Array.isArray(value) && value.every(isWarp)
}
