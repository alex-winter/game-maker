import test from 'node:test'
import assert from 'node:assert/strict'
import { BattleData, battleResult, battleStep, combatant, damageDealt, damageRoll, foeChoice, hits, newBattle, playerFirst, playerMoves } from './battle'
import { newCreature, newMove, newSpecies, Species } from './creature'
import { BattleRequest } from './encounter'

// Species with flat 50s, level 10: every stat is floor(50 × 10 / 50) + 5 = 15; max HP 15 + 10 + 10 = 35.
const flat = { hp: 50, attack: 50, defense: 50, specialAttack: 50, specialDefense: 50, speed: 50 }
const tackle = newMove('tackle', 'Tackle', 40, 100, 'normal')
const ember = newMove('ember', 'Ember', 40, 100, 'fire', 'special')
const blast = newMove('blast', 'Blast', 400, 100, 'normal')
const wild = newMove('wild', 'Wild Swing', 40, 0, 'normal')
const growl = newMove('growl', 'Growl', 0, 100, 'normal')
const sprout: Species = newSpecies('sprout', 'Sprout', ['grass'], flat, [{ level: 1, moveId: 'tackle' }, { level: 1, moveId: 'ember' }, { level: 1, moveId: 'blast' }, { level: 1, moveId: 'wild' }])
const pebble: Species = newSpecies('pebble', 'Pebble', ['rock'], flat, [{ level: 1, moveId: 'tackle' }])
const slug: Species = newSpecies('slug', 'Slug', ['normal'], { ...flat, speed: 10 }, [{ level: 1, moveId: 'tackle' }])
const hare: Species = newSpecies('hare', 'Hare', ['normal'], { ...flat, speed: 90 }, [{ level: 1, moveId: 'blast' }])
const speciesOf = (id: string) => [sprout, pebble, slug, hare].find(species => species.id === id)
const data: BattleData = {
    moves: [tackle, ember, blast, wild, growl],
    typeChart: { fire: { grass: 2, rock: 0.5 }, normal: { ghost: 0 } },
    species: [sprout, pebble, slug, hare],
}

const fixed = (...values: number[]) => {
    let at = 0

    return () => values[at++ % values.length] ?? 0
}

function request(speciesId = 'pebble', level = 10, party = [newCreature(sprout, 10)]): BattleRequest {
    return { party, opponents: [{ speciesId, level }], trainer: null }
}

test('the damage formula, worked by hand: level 10, power 40, attack 15 against defense 15', () => {
    const user = combatant(newCreature(sprout, 10), sprout)
    const target = combatant(newCreature(pebble, 10), pebble)

    // floor(2 × 10 / 5 + 2) = 6; 6 × 40 × 15 / 15 / 50 = 4.8; floor(4.8) + 2 = 6 base.
    assert.equal(damageDealt(user, target, tackle, data.typeChart, 100), 6, 'no STAB (grass user, normal move), ×1, full roll')
    assert.equal(damageDealt(user, target, tackle, data.typeChart, 85), 5, 'the 85 % roll: floor(6 × 0.85)')
    // Ember from a grass user: no STAB; fire against rock is ×0.5 → floor(6 × 0.5) = 3.
    assert.equal(damageDealt(user, target, ember, data.typeChart, 100), 3, 'resisted halves it')
    // Tackle from a normal user (Hare) gets STAB: floor(6 × 1.5) = 9.
    assert.equal(damageDealt(combatant(newCreature(hare, 10), hare), target, tackle, data.typeChart, 100), 9, 'STAB is ×1.5 and is tested here')
    // Super effective: a fire special move from Pebble (no STAB) on grass Sprout: 6 × 2 = 12.
    assert.equal(damageDealt(target, user, ember, data.typeChart, 100), 12, 'super effective doubles')
    // Blast, power 400: 6 × 400 × 15 / 15 / 50 = 48; + 2 = 50.
    assert.equal(damageDealt(user, target, blast, data.typeChart, 100), 50)
    assert.equal(damageDealt(user, { ...target, species: { ...pebble, types: ['ghost'] } }, tackle, data.typeChart, 100), 0, 'immune deals nothing')
    assert.equal(damageDealt(user, target, growl, data.typeChart, 100), 0, 'a status move (power 0) deals nothing yet')
    assert.equal(damageDealt(user, { ...target, stats: { ...target.stats, defense: 100000 } }, tackle, data.typeChart, 85), 1, 'never less than 1 when it connects')
})

test('rolls: accuracy 0 never hits, 100 always; the damage roll spans 85–100', () => {
    assert.equal(hits(0, () => 0), false)
    assert.equal(hits(0, () => 0.999), false)
    assert.equal(hits(100, () => 0.999), true)
    assert.equal(hits(50, () => 0.49), true)
    assert.equal(hits(50, () => 0.5), false)
    assert.equal(damageRoll(() => 0), 85)
    assert.equal(damageRoll(() => 0.999), 100)
})

test('a high-power move faints the opponent and wins; the result carries the fighter back into the party', () => {
    const state = newBattle(request(), speciesOf)

    assert.ok(state !== undefined)
    assert.equal(state.foe.creature.hp, 35)
    assert.equal(state.canRun, true)

    // Random: foe's move pick, then the player's accuracy roll and damage roll (player is first on the speed tie).
    const after = battleStep(state, { kind: 'move', moveId: 'blast' }, data, fixed(0, 0, 0))

    assert.equal(after.outcome, 'won')
    assert.equal(after.foe.creature.hp, 0)
    // A level 10 foe yields 120 points: 1000 + 120 = 1120 < 11³ = 1331, so no level this time (T-054).
    assert.deepEqual(after.log, ['SPROUT used BLAST!', 'Wild PEBBLE fainted!', 'SPROUT gained 120 EXP. Points!'])
    assert.equal(after.player.creature.hp, 35, 'the fainted foe never got its turn')
    assert.equal(after.player.creature.experience, 1120)

    const result = battleResult(after)

    assert.equal(result.outcome, 'won')
    assert.equal(result.party[0]?.hp, 35)
    assert.equal(result.party[0]?.experience, 1120, 'the experience comes back in the party')
    assert.equal(battleStep(after, { kind: 'move', moveId: 'blast' }, data, fixed(0)), after, 'a finished battle does not step')
})

test('a move with accuracy 0 never deals damage, however the dice fall', () => {
    const state = newBattle(request(), speciesOf)

    assert.ok(state !== undefined)

    for (const roll of [0, 0.25, 0.5, 0.999]) {
        const after = battleStep(state, { kind: 'move', moveId: 'wild' }, data, fixed(0, roll, roll, 0.999, 0.999))

        assert.equal(after.foe.creature.hp, 35, 'untouched')
        assert.equal(after.log[1], 'But it missed!')
    }
})

test('a faster opponent acts first; on a tie the player does', () => {
    const quick = newBattle(request('hare', 10, [newCreature(slug, 10)]), speciesOf)
    const tied = newBattle(request('pebble', 10), speciesOf)

    assert.ok(quick !== undefined && tied !== undefined)
    assert.equal(playerFirst(quick), false)
    assert.equal(playerFirst(tied), true)

    // Hare hits first: with a full roll its STAB Blast does floor(50 × 1.5) = 75 ≥ 35, so the slug faints before it can move.
    const after = battleStep(quick, { kind: 'move', moveId: 'tackle' }, data, fixed(0, 0, 0.999))

    assert.equal(after.log[0], 'Wild HARE used BLAST!')
    assert.equal(after.outcome, 'lost')
    assert.equal(after.foe.creature.hp, 35, 'the slug never swung')
})

test('both sides trade blows when nobody faints, the log says so, and effectiveness is called out', () => {
    const state = newBattle(request('sprout', 10, [newCreature(pebble, 10)]), speciesOf)

    assert.ok(state !== undefined)

    // Pebble (player) uses Ember on grass Sprout. Random: foe's move pick (0 → Tackle), player hits (0), rolls 85 (0), foe hits (0), rolls 85 (0).
    const after = battleStep(state, { kind: 'move', moveId: 'ember' }, data, fixed(0, 0, 0, 0, 0))

    // 6 base × 2 (fire → grass) × 0.85 = 10.2 → 10; the Sprout's Tackle back (no STAB from a grass user): floor(6 × 0.85) = 5.
    assert.deepEqual(after.log, ['PEBBLE used EMBER!', "It's super effective!", 'Wild SPROUT used TACKLE!'])
    assert.equal(after.foe.creature.hp, 25)
    assert.equal(after.player.creature.hp, 30)
    assert.equal(after.outcome, null)

    // Make both tough enough to survive: the Sprout's special defense 300, the Pebble's defense 300.
    const sturdy = {
        ...state,
        foe: { ...state.foe, stats: { ...state.foe.stats, specialDefense: 300 } },
        player: { ...state.player, stats: { ...state.player.stats, defense: 300 } },
    }
    const traded = battleStep(sturdy, { kind: 'move', moveId: 'ember' }, data, fixed(0, 0, 0, 0, 0))

    // Ember: base floor(6 × 40 × 15 / 300 / 50) + 2 = 2; × 2 × 0.85 = 3.4 → 3. Tackle back: base 2 × 0.85 = 1.7 → 1.
    assert.equal(traded.foe.creature.hp, 32)
    assert.equal(traded.player.creature.hp, 34)
    assert.deepEqual(traded.log, ['PEBBLE used EMBER!', "It's super effective!", 'Wild SPROUT used TACKLE!'])
    assert.equal(traded.outcome, null)
    assert.equal(traded.turn, 1)
})

test('running ends a wild battle at once and is refused in a trainer battle', () => {
    const wildState = newBattle(request(), speciesOf)
    const trainerState = newBattle({ ...request(), trainer: { eventId: 'ace', name: 'Ace', defeatedFlagId: 'beat-ace' } }, speciesOf)

    assert.ok(wildState !== undefined && trainerState !== undefined)

    const ran = battleStep(wildState, { kind: 'run' }, data, fixed(0))

    assert.equal(ran.outcome, 'fled')
    assert.deepEqual(ran.log, ['Got away safely!'])
    assert.equal(battleResult(ran).outcome, 'fled')

    const stuck = battleStep(trainerState, { kind: 'run' }, data, fixed(0))

    assert.equal(stuck.outcome, null)
    assert.deepEqual(stuck.log, ["There's no running from a trainer battle!"])
})

test('newBattle refuses an unknown species or a party with nobody standing; the foe picks among its known moves', () => {
    assert.equal(newBattle(request('ghostly'), speciesOf), undefined)
    assert.equal(newBattle(request('pebble', 10, [{ ...newCreature(sprout, 10), hp: 0 }]), speciesOf), undefined)

    const state = newBattle(request('pebble', 10, [{ ...newCreature(sprout, 10), hp: 0 }, newCreature(sprout, 10)]), speciesOf)

    assert.ok(state !== undefined)
    assert.equal(state.partyIndex, 1, 'the first able creature fights')
    assert.deepEqual(playerMoves(state, data).map(move => move.id), ['tackle', 'ember', 'blast', 'wild'])
    assert.equal(foeChoice(state, data, () => 0)?.id, 'tackle')
})

test('a win that crosses a level refills the fighter and recomputes its stats (T-054)', () => {
    // A level 5 Sprout (125 points) one point short of level 6 beats a level 10 foe: +120 → 245 ≥ 216.
    const nearly = { ...newCreature(sprout, 5), experience: 215 }
    const state = newBattle(request('pebble', 10, [nearly]), speciesOf)

    assert.ok(state !== undefined)
    assert.equal(state.player.stats.attack, 10, 'floor(50 × 5 / 50) + 5')

    // At level 5 Blast does floor(floor(4) × 400 × 10 / 15 / 50) + 2 = 23 → × 0.85 = 19 < 35: a two-turn fight. Give the foe 1 HP instead.
    const weakFoe = { ...state, foe: { ...state.foe, creature: { ...state.foe.creature, hp: 1 } } }
    const after = battleStep(weakFoe, { kind: 'move', moveId: 'blast' }, data, fixed(0, 0, 0))

    assert.equal(after.outcome, 'won')
    assert.equal(after.log[0], 'Wild PEBBLE used TACKLE!', 'the faster foe struck first: floor(6 × 40 × 15 / 10 / 50) + 2 = 9, × 0.85 = 7')
    assert.equal(after.player.creature.level, 6)
    assert.equal(after.player.maxHp, 27)
    assert.equal(after.player.creature.hp, 27, 'refilled from 18 to the new maximum')
    assert.equal(after.player.stats.attack, 11, 'floor(50 × 6 / 50) + 5: stats follow the level')
    assert.ok(after.log.includes('SPROUT grew to Lv6!'))
})

test("a trainer's second creature comes out when the first faints; the battle is won only once the whole party is down (T-057)", () => {
    const ace = { eventId: 'ace', name: 'Ace', defeatedFlagId: 'beat-ace' }
    const state = newBattle({ party: [newCreature(sprout, 10)], opponents: [{ speciesId: 'pebble', level: 10 }, { speciesId: 'slug', level: 10 }], trainer: ace }, speciesOf)

    assert.ok(state !== undefined)
    assert.equal(state.canRun, false)
    assert.equal(state.foeIndex, 0)

    const first = battleStep(state, { kind: 'move', moveId: 'blast' }, data, fixed(0, 0, 0))

    assert.equal(first.outcome, null, 'not a win: another creature remains')
    assert.equal(first.foeIndex, 1)
    assert.equal(first.foe.species.id, 'slug')
    assert.equal(first.foe.creature.level, 10)
    assert.equal(first.foe.creature.hp, first.foe.maxHp, 'fresh')
    assert.deepEqual(first.log, ['SPROUT used BLAST!', 'Foe PEBBLE fainted!', 'SPROUT gained 120 EXP. Points!', 'ACE sent out SLUG!'])
    assert.equal(battleResult(first).outcome, 'fled', 'an unfinished battle has no win to report')

    const second = battleStep(first, { kind: 'move', moveId: 'blast' }, data, fixed(0, 0, 0))

    assert.equal(second.outcome, 'won')
    assert.equal(second.foeIndex, 1)
    assert.equal(second.player.creature.experience, 1000 + 120 + 120, 'both faints paid')

    // A second creature whose species is gone cannot be sent out: the win stands at the first faint.
    const gone = newBattle({ party: [newCreature(sprout, 10)], opponents: [{ speciesId: 'pebble', level: 10 }, { speciesId: 'ghostly', level: 12 }], trainer: ace }, speciesOf)

    assert.ok(gone !== undefined)
    assert.equal(battleStep(gone, { kind: 'move', moveId: 'blast' }, data, fixed(0, 0, 0)).outcome, 'won')
})
