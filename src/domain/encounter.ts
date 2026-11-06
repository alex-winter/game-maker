import { Party } from './creature'
import { Id } from './id'
import { Random } from './random'

/** One line of a map's encounter table: a species, the levels it appears at, and how likely against the other lines. */
export type EncounterEntry = {
    readonly speciesId: Id

    readonly minLevel: number

    readonly maxLevel: number

    /** Relative weight; 0 means never. */
    readonly weight: number
}

/** What lives in a map's tall grass (T-048). */
export type EncounterTable = {
    /** Percent chance that a step onto grass starts an encounter, 0–100. */
    readonly rate: number

    readonly entries: readonly EncounterEntry[]
}

export const DEFAULT_ENCOUNTER_RATE = 10

export function emptyEncounterTable(): EncounterTable {
    return { rate: DEFAULT_ENCOUNTER_RATE, entries: [] }
}

/** Who issued a challenge (T-049): the trainer's event, their name for the box, and the flag a win sets. Null for wild grass. */
export type TrainerChallenge = {
    readonly eventId: Id

    readonly name: string

    readonly defeatedFlagId: Id
}

/**
 * What the field hands a battle: the player's party and the opponent's
 * species and level, plus who the opponent is when a trainer sent it.
 * The battle scene (T-053) opens from it.
 */
export type BattleRequest = {
    readonly party: Party

    readonly speciesId: Id

    readonly level: number

    readonly trainer: TrainerChallenge | null
}

/** What a battle hands back: who won and the party as it stands after. */
export type BattleResult = {
    readonly outcome: 'won' | 'lost' | 'fled'

    readonly party: Party
}

/** The entry a weighted pick lands on, or undefined when every weight is 0. `roll` is a number in [0, 1). */
export function pickEntry(entries: readonly EncounterEntry[], roll: number): EncounterEntry | undefined {
    const total = entries.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0)

    if (total <= 0) {
        return undefined
    }

    let remaining = Math.min(total - Number.EPSILON, Math.max(0, roll) * total)

    for (const entry of entries) {
        const weight = Math.max(0, entry.weight)

        if (weight > 0 && remaining < weight) {
            return entry
        }

        remaining -= weight
    }

    return undefined
}

/**
 * The roll for a step onto grass: first whether anything appears at all
 * (`rate` percent), then which line of the table, then a level in its
 * range. Null means the grass stayed quiet. Pure given `random`.
 */
export function rollEncounter(table: EncounterTable, party: Party, random: Random): BattleRequest | null {
    if (table.rate <= 0 || random() * 100 >= table.rate) {
        return null
    }

    const entry = pickEntry(table.entries, random())

    if (entry === undefined) {
        return null
    }

    const low = Math.min(entry.minLevel, entry.maxLevel)
    const high = Math.max(entry.minLevel, entry.maxLevel)
    const level = low + Math.floor(random() * (high - low + 1))

    return { party, speciesId: entry.speciesId, level: Math.min(high, level), trainer: null }
}

/** A party member or a wild creature as the battle message names it. */
export function wildAppearedText(speciesName: string | undefined): string {
    return speciesName === undefined ? 'Something rustled in the grass, but the project has no such species.' : `A wild ${speciesName.toUpperCase()} appeared!`
}

function isWholeInRange(value: unknown, low: number, high: number): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value >= low && value <= high
}

export function isEncounterTable(value: unknown): value is EncounterTable {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const record = value as { rate?: unknown; entries?: unknown }

    return isWholeInRange(record.rate, 0, 100)
        && Array.isArray(record.entries)
        && record.entries.every(entry => typeof entry === 'object' && entry !== null
            && typeof (entry as { speciesId?: unknown }).speciesId === 'string'
            && isWholeInRange((entry as { minLevel?: unknown }).minLevel, 1, 100)
            && isWholeInRange((entry as { maxLevel?: unknown }).maxLevel, 1, 100)
            && isWholeInRange((entry as { weight?: unknown }).weight, 0, 1000))
}
