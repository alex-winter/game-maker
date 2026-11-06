import { Id } from './id'
import { Move } from './creature'

/**
 * Battle data (T-052): which stat a move hits with, and how types match
 * up. Both are plain data the editor changes; the damage function in
 * T-053 reads them and hardcodes nothing.
 */
export type DamageClass = 'physical' | 'special'

export const DAMAGE_CLASSES: readonly DamageClass[] = ['physical', 'special']

export const DEFAULT_DAMAGE_CLASS: DamageClass = 'physical'

export function isDamageClass(value: unknown): value is DamageClass {
    return value === 'physical' || value === 'special'
}

/** The multipliers a matchup may have: immune, resisted, plain, super effective. */
export const MULTIPLIERS: readonly number[] = [0, 0.5, 1, 2]

/** Keyed by attacking type, then defending type. An entry that is missing is ×1, so the chart only stores the exceptions. */
export type TypeChart = {
    readonly [attacking: string]: { readonly [defending: string]: number }
}

export const EMPTY_TYPE_CHART: TypeChart = {}

/** One attacking type against one defending type: the stored multiplier, or 1. */
export function matchup(chart: TypeChart, attacking: string, defending: string): number {
    return chart[attacking]?.[defending] ?? 1
}

/** A move's type against a creature's one or two types: the matchups multiplied, so 2 × 0.5 is 1 and anything × 0 is 0. */
export function effectiveness(chart: TypeChart, attacking: string, defending: readonly string[]): number {
    return defending.reduce((product, type) => product * matchup(chart, attacking, type), 1)
}

/** The chart with one matchup set. ×1 removes the entry, since that is what a missing one means. */
export function withMatchup(chart: TypeChart, attacking: string, defending: string, multiplier: number): TypeChart {
    const row: { [defending: string]: number } = { ...chart[attacking] }

    if (multiplier === 1) {
        delete row[defending]
    } else {
        row[defending] = multiplier
    }

    const next: { [attacking: string]: { [defending: string]: number } } = { ...chart }

    if (Object.keys(row).length === 0) {
        delete next[attacking]
    } else {
        next[attacking] = row
    }

    return next
}

/** Every type name the chart mentions, attacking or defending, sorted. */
export function chartTypes(chart: TypeChart): string[] {
    const names = new Set<string>()

    for (const [attacking, row] of Object.entries(chart)) {
        names.add(attacking)

        for (const defending of Object.keys(row)) {
            names.add(defending)
        }
    }

    return [...names].sort()
}

export function isTypeChart(value: unknown): value is TypeChart {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return false
    }

    return Object.entries(value as { [key: string]: unknown }).every(([attacking, row]) =>
        attacking.trim() !== ''
        && typeof row === 'object' && row !== null && !Array.isArray(row)
        && Object.entries(row as { [key: string]: unknown }).every(([defending, multiplier]) => defending.trim() !== '' && MULTIPLIERS.includes(multiplier as number)))
}

/** A move stored before T-052 hits physically. */
export function withMoveDefaults(stored: Omit<Move, 'damageClass'> & Partial<Pick<Move, 'damageClass'>>): Move {
    return { ...stored, damageClass: isDamageClass(stored.damageClass) ? stored.damageClass : DEFAULT_DAMAGE_CLASS }
}

/** The move named, or undefined: what a creature's move slots resolve through. */
export function moveById(moves: readonly Move[], moveId: Id): Move | undefined {
    return moves.find(move => move.id === moveId)
}
