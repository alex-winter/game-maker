import { Cell, isCell } from './coordinates'
import { isMemory, Memory } from './flags'
import { Id } from './id'
import { Bag, isBag } from './item'
import { isParty, Party } from './creature'
import { Direction, isDirection } from './movement'

/** Everything a play session needs to resume: where the player is and what the world remembers. Never the map itself. */
export type SavedSession = {
    readonly mapId: Id

    readonly cell: Cell

    readonly facing: Direction

    readonly memory: Memory

    readonly bag: Bag

    /** The creatures carried (T-047). A save written before them resumes with nobody. */
    readonly party: Party
}

export const SAVE_VERSION = 1

/** One slot, with when it was written (ISO 8601) so a later slot screen can show it. */
export type SaveSlot = SavedSession & {
    readonly savedAt: string
}

/** The whole save file. One slot today; the list is here so more slots need no new version. */
export type SaveDocument = {
    readonly version: typeof SAVE_VERSION

    readonly slots: readonly SaveSlot[]
}

export type ParseResult =
    | { readonly ok: true; readonly session: SavedSession }
    | { readonly ok: false; readonly reason: string }

export function serializeSave(session: SavedSession, savedAt: string): SaveDocument {
    return {
        version: SAVE_VERSION,
        slots: [{ mapId: session.mapId, cell: session.cell, facing: session.facing, memory: session.memory, bag: session.bag, party: session.party, savedAt }],
    }
}

export function isSavedSession(value: unknown): value is SavedSession {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const session = value as { [K in keyof SavedSession]?: unknown }

    return typeof session.mapId === 'string'
        && isCell(session.cell)
        && isDirection(session.facing)
        && isMemory(session.memory)
        && isBag(session.bag)
        && (session.party === undefined || isParty(session.party))
}

/**
 * Reads the first slot of a save file. Refuses a wrong version or a
 * malformed slot with a reason, never a partial session.
 */
export function parseSave(value: unknown): ParseResult {
    if (typeof value !== 'object' || value === null) {
        return { ok: false, reason: 'The save is not an object' }
    }

    const document = value as { version?: unknown; slots?: unknown }

    if (document.version !== SAVE_VERSION) {
        return { ok: false, reason: `Save version ${String(document.version)} is not ${SAVE_VERSION}` }
    }

    if (!Array.isArray(document.slots) || document.slots.length === 0) {
        return { ok: false, reason: 'The save has no slot' }
    }

    const slot: unknown = document.slots[0]

    if (!isSavedSession(slot)) {
        return { ok: false, reason: 'The slot is missing a field or has one of the wrong shape' }
    }

    return { ok: true, session: { mapId: slot.mapId, cell: slot.cell, facing: slot.facing, memory: slot.memory, bag: slot.bag, party: slot.party ?? [] } }
}
