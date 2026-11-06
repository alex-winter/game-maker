import { Id } from './id'

/**
 * A move (T-047), extended in place by T-052 with the stat it hits with.
 * Power 0 is a status move: it exists, and the damage function refuses it
 * until a later ticket gives it something to do.
 */
export type Move = {
    readonly id: Id

    name: string

    power: number

    /** Percent, 0–100. */
    accuracy: number

    /** A type name the author chose, matched against the project's type chart (T-052). */
    type: string

    /** Physical hits with attack against defense; special with the special pair (T-052). */
    damageClass: 'physical' | 'special'
}

/** The six numbers the author enters per species. No real game's formula is imported. */
export type BaseStats = {
    readonly hp: number

    readonly attack: number

    readonly defense: number

    readonly specialAttack: number

    readonly specialDefense: number

    readonly speed: number
}

export const STAT_NAMES: readonly (keyof BaseStats)[] = ['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed']

/** A move a species learns on reaching a level. */
export type LearnsetEntry = {
    readonly level: number

    readonly moveId: Id
}

export type Species = {
    readonly id: Id

    name: string

    /** One or two type names. Free text the author keeps consistent; T-052's chart is keyed by them. */
    types: string[]

    baseStats: BaseStats

    learnset: LearnsetEntry[]
}

/** One creature in a party: which species, how far along, how hurt, and what it knows. */
export type Creature = {
    readonly speciesId: Id

    readonly level: number

    /** Current HP; 0 means fainted. */
    readonly hp: number

    /** Total experience; `experienceForLevel(level)` or more. */
    readonly experience: number

    /** Up to `MAX_MOVES` move ids. */
    readonly moves: readonly Id[]
}

export type Party = readonly Creature[]

export const MAX_PARTY = 6

export const MAX_MOVES = 4

export const MIN_LEVEL = 1

export const MAX_LEVEL = 100

/** The creature the new game hands the player, or null until the author picks one. */
export type Starter = {
    readonly speciesId: Id

    readonly level: number
}

export function newMove(id: Id, name: string, power = 40, accuracy = 100, type = 'normal', damageClass: Move['damageClass'] = 'physical'): Move {
    return { id, name, power, accuracy, type, damageClass }
}

export const DEFAULT_BASE_STATS: BaseStats = { hp: 45, attack: 45, defense: 45, specialAttack: 45, specialDefense: 45, speed: 45 }

export function newSpecies(id: Id, name: string, types: string[] = ['normal'], baseStats: BaseStats = DEFAULT_BASE_STATS, learnset: LearnsetEntry[] = []): Species {
    return { id, name, types, baseStats, learnset }
}

/** The total experience a creature has on reaching `level`: `level³`, written down here and in T-054's test, not tuned to any game. */
export function experienceForLevel(level: number): number {
    return level * level * level
}

/**
 * A stat at a level. Our own plain rule, not a real game's: a base of 50 at
 * level 50 gives 55, so numbers stay readable on a 240×160 screen.
 */
export function statAt(base: number, level: number): number {
    return Math.floor(base * level / 50) + 5
}

/** Max HP at a level: the same rule plus the level and ten, so even a level 1 creature has a few hits in it. */
export function maxHpAt(species: Species, level: number): number {
    return statAt(species.baseStats.hp, level) + level + 10
}

/** The moves a species knows at `level`: the last `MAX_MOVES` learnset entries at or below it, in learnset order. */
export function movesAtLevel(species: Species, level: number): Id[] {
    const known = species.learnset.filter(entry => entry.level <= level).map(entry => entry.moveId)
    const unique = known.filter((moveId, index) => known.indexOf(moveId) === index)

    return unique.slice(Math.max(0, unique.length - MAX_MOVES))
}

/** A fresh creature of a species at a level: full HP, the moves its learnset gives by then. */
export function newCreature(species: Species, level: number): Creature {
    const clamped = Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, Math.floor(level)))

    return {
        speciesId: species.id,
        level: clamped,
        hp: maxHpAt(species, clamped),
        experience: experienceForLevel(clamped),
        moves: movesAtLevel(species, clamped),
    }
}

export function isFainted(creature: Creature): boolean {
    return creature.hp <= 0
}

/** True when someone in the party can still stand. */
export function hasAbleCreature(party: Party): boolean {
    return party.some(creature => !isFainted(creature))
}

/** The party with one more creature, or undefined when it is already `MAX_PARTY` strong. */
export function addToParty(party: Party, creature: Creature): Party | undefined {
    return party.length >= MAX_PARTY ? undefined : [...party, creature]
}

/** The creature at full HP again. */
export function healed(creature: Creature, species: Species): Creature {
    return { ...creature, hp: maxHpAt(species, creature.level) }
}

/** The creature after `amount` damage, never below zero. */
export function damaged(creature: Creature, amount: number): Creature {
    return { ...creature, hp: Math.max(0, creature.hp - Math.max(0, Math.floor(amount))) }
}

/** The party a new game starts with: the authored starter, or nobody when none is set or its species is gone. */
export function starterParty(starter: Starter | null, species: readonly Species[]): Party {
    if (starter === null) {
        return []
    }

    const chosen = species.find(candidate => candidate.id === starter.speciesId)

    return chosen === undefined ? [] : [newCreature(chosen, starter.level)]
}

function isNonNegativeNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

export function isBaseStats(value: unknown): value is BaseStats {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const record = value as { [key: string]: unknown }

    return STAT_NAMES.every(name => isNonNegativeNumber(record[name]) && Number.isInteger(record[name]))
}

function isLearnsetEntry(value: unknown): value is LearnsetEntry {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const record = value as { level?: unknown; moveId?: unknown }

    return typeof record.level === 'number' && Number.isInteger(record.level) && record.level >= MIN_LEVEL && record.level <= MAX_LEVEL
        && typeof record.moveId === 'string'
}

/** True for a species body as the editor sends it: a non-empty name, one or two type names, six whole stats, a learnset. */
export function isSpeciesInput(value: unknown): value is Omit<Species, 'id'> {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const record = value as { [key: string]: unknown }

    return typeof record.name === 'string' && record.name.trim() !== ''
        && Array.isArray(record.types) && record.types.length >= 1 && record.types.length <= 2 && record.types.every(type => typeof type === 'string' && type.trim() !== '')
        && isBaseStats(record.baseStats)
        && Array.isArray(record.learnset) && record.learnset.every(isLearnsetEntry)
}

/** True for a move body as the editor sends it. */
export function isMoveInput(value: unknown): value is Omit<Move, 'id' | 'damageClass'> & Partial<Pick<Move, 'damageClass'>> {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const record = value as { [key: string]: unknown }

    return typeof record.name === 'string' && record.name.trim() !== ''
        && isNonNegativeNumber(record.power) && Number.isInteger(record.power)
        && isNonNegativeNumber(record.accuracy) && Number.isInteger(record.accuracy) && record.accuracy <= 100
        && typeof record.type === 'string' && record.type.trim() !== ''
        && (record.damageClass === undefined || record.damageClass === 'physical' || record.damageClass === 'special')
}

export function isStarter(value: unknown): value is Starter {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const record = value as { speciesId?: unknown; level?: unknown }

    return typeof record.speciesId === 'string'
        && typeof record.level === 'number' && Number.isInteger(record.level) && record.level >= MIN_LEVEL && record.level <= MAX_LEVEL
}

function isCreature(value: unknown): value is Creature {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const record = value as { [key: string]: unknown }

    return typeof record.speciesId === 'string'
        && typeof record.level === 'number' && Number.isInteger(record.level)
        && isNonNegativeNumber(record.hp)
        && isNonNegativeNumber(record.experience)
        && Array.isArray(record.moves) && record.moves.length <= MAX_MOVES && record.moves.every(moveId => typeof moveId === 'string')
}

/** Structural check for a party read from a save. */
export function isParty(value: unknown): value is Party {
    return Array.isArray(value) && value.length <= MAX_PARTY && value.every(isCreature)
}
