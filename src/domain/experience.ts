import { Creature, experienceForLevel, healed, MAX_LEVEL, MAX_MOVES, Species } from './creature'
import { Id } from './id'

/**
 * Experience and levels (T-054). The curve is `experienceForLevel(n) = n³`
 * — total experience on reaching level n — and a win yields
 * `EXPERIENCE_PER_FOE_LEVEL × the foe's level`. Both are our own plain
 * rules, written down here and in the tests, not tuned to any game.
 */
export const EXPERIENCE_PER_FOE_LEVEL = 12

export function experienceYield(foeLevel: number): number {
    return EXPERIENCE_PER_FOE_LEVEL * Math.max(1, Math.floor(foeLevel))
}

/** One level gained: the new level, the learnset moves taken up, and the ones skipped for want of a free slot. */
export type LevelUp = {
    readonly level: number

    readonly learned: readonly Id[]

    readonly skipped: readonly Id[]
}

export type Growth = {
    readonly creature: Creature

    readonly levelUps: readonly LevelUp[]
}

/** The level a total of `experience` reaches: the highest n with n³ ≤ experience, capped at `MAX_LEVEL`. */
export function levelForExperience(experience: number): number {
    let level = 1

    while (level < MAX_LEVEL && experienceForLevel(level + 1) <= experience) {
        level++
    }

    return level
}

/** One level up: HP refilled to the new maximum, and the learnset's moves for that level added while slots are free. */
function levelUp(creature: Creature, species: Species, level: number): { creature: Creature; levelUp: LevelUp } {
    const learned: Id[] = []
    const skipped: Id[] = []
    let moves = [...creature.moves]

    for (const entry of species.learnset.filter(each => each.level === level)) {
        if (moves.includes(entry.moveId)) {
            continue
        }

        if (moves.length < MAX_MOVES) {
            moves = [...moves, entry.moveId]
            learned.push(entry.moveId)
        } else {
            skipped.push(entry.moveId)
        }
    }

    const raised: Creature = { ...creature, level, moves }

    return { creature: healed(raised, species), levelUp: { level, learned, skipped } }
}

/**
 * Adds experience and applies every level the new total reaches, one at a
 * time, so each level's learnset moves are offered in order. A creature at
 * `MAX_LEVEL` keeps gaining numbers and nothing else.
 */
export function gainExperience(creature: Creature, species: Species, amount: number): Growth {
    const experience = creature.experience + Math.max(0, Math.floor(amount))
    const target = levelForExperience(experience)
    const levelUps: LevelUp[] = []
    let current: Creature = { ...creature, experience }

    for (let level = creature.level + 1; level <= target; level++) {
        const result = levelUp(current, species, level)

        current = result.creature
        levelUps.push(result.levelUp)
    }

    return { creature: current, levelUps }
}

/** What the box says about a growth: the points, each level, each move learned or skipped. */
export function growthLines(name: string, amount: number, growth: Growth, moveName: (moveId: Id) => string): string[] {
    const who = name.toUpperCase()
    const lines = [`${who} gained ${amount} EXP. Points!`]

    for (const levelUp of growth.levelUps) {
        lines.push(`${who} grew to Lv${levelUp.level}!`)

        for (const moveId of levelUp.learned) {
            lines.push(`${who} learned ${moveName(moveId).toUpperCase()}!`)
        }

        for (const moveId of levelUp.skipped) {
            lines.push(`${who} wants to learn ${moveName(moveId).toUpperCase()}, but has no room.`)
        }
    }

    return lines
}
