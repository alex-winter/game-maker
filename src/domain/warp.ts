import { Cell, isCell } from './coordinates'
import { Id } from './id'
import { Direction, isDirection, Player } from './movement'
import { MetatileId } from './tileset'

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

/** A readable sign: interacting with it (T-034) shows the dialog `dialogId` (authored in T-036). */
export type Sign = {
    readonly kind: 'sign'

    readonly id: Id

    cell: Cell

    dialogId: Id
}

/**
 * An item lying on a cell (T-038). Picking it up sets `flagId`; while that
 * flag is set the item is gone. `metatileId` is the picture drawn on the
 * cell until then — null for an invisible item.
 */
export type ItemEvent = {
    readonly kind: 'item'

    readonly id: Id

    cell: Cell

    itemId: Id

    flagId: Id

    metatileId: MetatileId | null
}

/**
/** What a person does when left alone (T-044): stand, turn in place, or wander nearby. */
export type NpcBehavior = 'still' | 'look' | 'wander'

export const NPC_BEHAVIORS: readonly NpcBehavior[] = ['still', 'look', 'wander']

export const DEFAULT_BEHAVIOR: NpcBehavior = 'still'

export function isNpcBehavior(value: unknown): value is NpcBehavior {
    return NPC_BEHAVIORS.includes(value as NpcBehavior)
}

/**
 * A person standing on a cell (T-042): what they look like, which way they
 * face, what they say when talked to (T-043), and what they do when left
 * alone (T-044).
 */
export type NpcEvent = {
    readonly kind: 'npc'

    readonly id: Id

    cell: Cell

    name: string

    /** A `SpriteDefinition` id, or null to draw a stand-in rectangle. */
    spriteId: Id | null

    facing: Direction

    /** The dialog spoken when talked to, or null for a person with nothing to say yet. */
    dialogId: Id | null

    behavior: NpcBehavior
}

/** Something placed on a map cell that is not a tile. */
export type MapEvent = Warp | Sign | ItemEvent | NpcEvent

export function newSign(id: Id, cell: Cell, dialogId: Id): Sign {
    return { kind: 'sign', id, cell, dialogId }
}

export function newItemEvent(id: Id, cell: Cell, itemId: Id, flagId: Id, metatileId: MetatileId | null): ItemEvent {
    return { kind: 'item', id, cell, itemId, flagId, metatileId }
}

export function newNpcEvent(id: Id, cell: Cell, name: string, spriteId: Id | null, facing: Direction, dialogId: Id | null, behavior: NpcBehavior = DEFAULT_BEHAVIOR): NpcEvent {
    return { kind: 'npc', id, cell, name, spriteId, facing, dialogId, behavior }
}

/** A stored event brought up to date: a person saved before T-044 stands still. */
export function withEventDefaults(event: MapEvent): MapEvent {
    if (event.kind !== 'npc') {
        return event
    }

    const stored: Partial<NpcEvent> = event

    return { ...event, behavior: isNpcBehavior(stored.behavior) ? stored.behavior : DEFAULT_BEHAVIOR }
}

/** The people standing on a map. */
export function npcsOn(events: readonly MapEvent[]): NpcEvent[] {
    return events.filter((event): event is NpcEvent => event.kind === 'npc')
}

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

/** The events with one added or, when `event.id` already exists, replaced. One event of a kind per cell: a same-kind event on that cell is dropped. */
export function withEvent(events: readonly MapEvent[], event: MapEvent): MapEvent[] {
    const kept = events.filter(existing => existing.id !== event.id && !(existing.kind === event.kind && sameCell(existing.cell, event.cell)))

    return [...kept, event]
}

/** Every event on a cell, in list order. */
export function eventsAt(events: readonly MapEvent[], cell: Cell): MapEvent[] {
    return events.filter(event => sameCell(event.cell, cell))
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

function isPlaced(value: unknown): value is { kind: unknown; id: string; cell: Cell } {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const event = value as { id?: unknown; cell?: unknown }

    return typeof event.id === 'string' && isCell(event.cell)
}

function isMapEvent(value: unknown): value is MapEvent {
    if (!isPlaced(value)) {
        return false
    }

    const event = value as { kind: unknown; dialogId?: unknown; itemId?: unknown; flagId?: unknown; metatileId?: unknown; name?: unknown; spriteId?: unknown; facing?: unknown; behavior?: unknown }

    switch (event.kind) {
        case 'warp':
            return isWarp(value)
        case 'sign':
            return typeof event.dialogId === 'string'
        case 'item':
            return typeof event.itemId === 'string' && typeof event.flagId === 'string'
                && (event.metatileId === null || Number.isInteger(event.metatileId))
        case 'npc':
            return typeof event.name === 'string'
                && (event.spriteId === null || typeof event.spriteId === 'string')
                && isDirection(event.facing)
                && (event.dialogId === null || typeof event.dialogId === 'string')
                && (event.behavior === undefined || isNpcBehavior(event.behavior))
        default:
            return false
    }
}

/** Structural check for a map's whole event list as the editor sends it. */
export function isMapEvents(value: unknown): value is MapEvent[] {
    return Array.isArray(value) && value.every(isMapEvent)
}
