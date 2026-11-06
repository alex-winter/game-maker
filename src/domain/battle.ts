import { effectiveness, TypeChart } from './battle-data'
import { BattleRequest, BattleResult } from './encounter'
import { Creature, damaged, isFainted, maxHpAt, Move, newCreature, Species, statAt } from './creature'
import { Id } from './id'
import { Random } from './random'

/**
 * A single-creature battle (T-053): one creature on each side, moves with
 * accuracy and damage, fainting, and a result. Pure: every roll comes from
 * the `Random` passed in, and the scene only draws what the state says.
 *
 * The damage formula is our own plain rule, written out in the tests:
 *
 *     base   = floor(floor(2 × level / 5 + 2) × power × attack / defense / 50) + 2
 *     damage = floor(base × stab × effectiveness × roll)
 *
 * where `attack`/`defense` are the physical or special pair by the move's
 * class, `stab` is 1.5 when the move shares a type with its user, the type
 * `effectiveness` comes from the project's chart, and `roll` is 85–100 %.
 * Anything the chart calls immune deals 0; otherwise at least 1.
 */
export type Stats = {
    readonly attack: number

    readonly defense: number

    readonly specialAttack: number

    readonly specialDefense: number

    readonly speed: number
}

/** One side of the battle: the creature as it stands, its species, its working stats. */
export type Combatant = {
    readonly creature: Creature

    readonly species: Species

    readonly stats: Stats

    readonly maxHp: number
}

/** What the player can ask for on their turn. */
export type BattleChoice =
    | { readonly kind: 'move'; readonly moveId: Id }
    | { readonly kind: 'run' }

export type BattleOutcome = BattleResult['outcome']

export type BattleState = {
    readonly player: Combatant

    readonly foe: Combatant

    /** The index into the party of the creature fighting, so the result can put it back. */
    readonly partyIndex: number

    readonly party: BattleRequest['party']

    /** Whether running is allowed: from a wild creature yes, from a trainer no (T-057). */
    readonly canRun: boolean

    /** What happened last turn, oldest first, for the scene to show. Empty before the first turn. */
    readonly log: readonly string[]

    readonly outcome: BattleOutcome | null

    readonly turn: number
}

/** The catalog and chart a battle resolves moves through. */
export type BattleData = {
    readonly moves: readonly Move[]

    readonly typeChart: TypeChart
}

export const STAB = 1.5

/** The lowest and highest the random roll scales damage by, in percent. */
export const MIN_ROLL = 85

export const MAX_ROLL = 100

export function combatant(creature: Creature, species: Species): Combatant {
    const { level } = creature
    const { baseStats } = species

    return {
        creature,
        species,
        maxHp: maxHpAt(species, level),
        stats: {
            attack: statAt(baseStats.attack, level),
            defense: statAt(baseStats.defense, level),
            specialAttack: statAt(baseStats.specialAttack, level),
            specialDefense: statAt(baseStats.specialDefense, level),
            speed: statAt(baseStats.speed, level),
        },
    }
}

/**
 * The battle a request opens: the first able creature of the party against
 * a fresh one of the requested species, or undefined when either species is
 * unknown or nobody in the party can stand.
 */
export function newBattle(request: BattleRequest, speciesOf: (speciesId: Id) => Species | undefined): BattleState | undefined {
    const partyIndex = request.party.findIndex(creature => !isFainted(creature))
    const fighter = request.party[partyIndex]
    const foeSpecies = speciesOf(request.speciesId)
    const fighterSpecies = fighter === undefined ? undefined : speciesOf(fighter.speciesId)

    if (fighter === undefined || fighterSpecies === undefined || foeSpecies === undefined) {
        return undefined
    }

    return {
        player: combatant(fighter, fighterSpecies),
        foe: combatant(newCreature(foeSpecies, request.level), foeSpecies),
        partyIndex,
        party: request.party,
        canRun: request.trainer === null,
        log: [],
        outcome: null,
        turn: 0,
    }
}

/** Whether a move with `accuracy` percent lands on this roll. Accuracy 0 never does; 100 always. */
export function hits(accuracy: number, random: Random): boolean {
    return random() * 100 < accuracy
}

/** The percentage the roll scales damage by: 85–100 inclusive. */
export function damageRoll(random: Random): number {
    return MIN_ROLL + Math.floor(random() * (MAX_ROLL - MIN_ROLL + 1))
}

/** The damage `move` does from `attacker` to `defender` for a given roll percentage; see the formula above. */
export function damageDealt(attacker: Combatant, defender: Combatant, move: Move, typeChart: TypeChart, rollPercent: number): number {
    if (move.power <= 0) {
        return 0
    }

    const attack = move.damageClass === 'special' ? attacker.stats.specialAttack : attacker.stats.attack
    const defense = move.damageClass === 'special' ? defender.stats.specialDefense : defender.stats.defense
    const multiplier = effectiveness(typeChart, move.type, defender.species.types)

    if (multiplier === 0) {
        return 0
    }

    const stab = attacker.species.types.includes(move.type) ? STAB : 1
    const base = Math.floor(Math.floor(2 * attacker.creature.level / 5 + 2) * move.power * attack / defense / 50) + 2

    return Math.max(1, Math.floor(base * stab * multiplier * rollPercent / 100))
}

/** How the box describes a matchup after the hit. Empty for ×1. */
export function effectivenessText(multiplier: number): string {
    if (multiplier === 0) {
        return 'It had no effect.'
    }

    if (multiplier > 1) {
        return "It's super effective!"
    }

    return multiplier < 1 ? "It's not very effective…" : ''
}

/** Who moves first: the faster creature; on a tie, the player. */
export function playerFirst(state: BattleState): boolean {
    return state.player.stats.speed >= state.foe.stats.speed
}

/** The foe picks one of its moves at random; undefined when it knows none. */
export function foeChoice(state: BattleState, data: BattleData, random: Random): Move | undefined {
    const known = state.foe.creature.moves.map(moveId => data.moves.find(move => move.id === moveId)).filter((move): move is Move => move !== undefined)

    return known[Math.floor(random() * known.length)]
}

type Side = 'player' | 'foe'

function other(side: Side): Side {
    return side === 'player' ? 'foe' : 'player'
}

/** How the log names the foe: a wild creature, or the trainer's. */
export function foePrefix(state: BattleState): string {
    return state.canRun ? 'Wild ' : 'Foe '
}

/** One creature's attack on the other, with the lines it writes. */
function attack(state: BattleState, side: Side, move: Move | undefined, data: BattleData, random: Random): BattleState {
    const user = state[side]
    const target = state[other(side)]
    const name = `${side === 'foe' ? foePrefix(state) : ''}${user.species.name.toUpperCase()}`

    if (move === undefined) {
        return { ...state, log: [...state.log, `${name} has no moves!`] }
    }

    const log = [...state.log, `${name} used ${move.name.toUpperCase()}!`]

    if (move.power <= 0) {
        return { ...state, log: [...log, 'But nothing happened.'] }
    }

    if (!hits(move.accuracy, random)) {
        return { ...state, log: [...log, 'But it missed!'] }
    }

    const multiplier = effectiveness(data.typeChart, move.type, target.species.types)
    const dealt = damageDealt(user, target, move, data.typeChart, damageRoll(random))
    const struck: Combatant = { ...target, creature: damaged(target.creature, dealt) }
    const note = effectivenessText(multiplier)
    const fainted = isFainted(struck.creature) ? [`${side === 'player' ? foePrefix(state) : ''}${struck.species.name.toUpperCase()} fainted!`] : []

    return { ...state, [other(side)]: struck, log: [...log, ...(note === '' ? [] : [note]), ...fainted] }
}

/**
 * One whole turn from the player's choice: running ends it at once when
 * allowed; otherwise both sides attack in speed order, the second only if
 * still standing, and a faint settles the outcome.
 */
export function battleStep(state: BattleState, choice: BattleChoice, data: BattleData, random: Random): BattleState {
    if (state.outcome !== null) {
        return state
    }

    const begun: BattleState = { ...state, log: [], turn: state.turn + 1 }

    if (choice.kind === 'run') {
        return begun.canRun
            ? { ...begun, outcome: 'fled', log: ['Got away safely!'] }
            : { ...begun, log: ["There's no running from a trainer battle!"] }
    }

    const playerMove = data.moves.find(move => move.id === choice.moveId)
    const foeMove = foeChoice(begun, data, random)
    const order: readonly [Side, Move | undefined][] = playerFirst(begun)
        ? [['player', playerMove], ['foe', foeMove]]
        : [['foe', foeMove], ['player', playerMove]]

    let next = begun

    for (const [side, move] of order) {
        if (isFainted(next.player.creature) || isFainted(next.foe.creature)) {
            break
        }

        next = attack(next, side, move, data, random)
    }

    return settle(next)
}

function settle(state: BattleState): BattleState {
    if (isFainted(state.foe.creature)) {
        return { ...state, outcome: 'won' }
    }

    if (isFainted(state.player.creature)) {
        return { ...state, outcome: 'lost' }
    }

    return state
}

/** The moves the player may pick this turn: what their creature knows, resolved through the catalog. */
export function playerMoves(state: BattleState, data: BattleData): Move[] {
    return state.player.creature.moves.map(moveId => data.moves.find(move => move.id === moveId)).filter((move): move is Move => move !== undefined)
}

/** The result the field takes back: the outcome and the party with the fighter as the battle left it. */
export function battleResult(state: BattleState): BattleResult {
    const party = state.party.map((creature, index) => (index === state.partyIndex ? state.player.creature : creature))

    return { outcome: state.outcome ?? 'fled', party }
}
