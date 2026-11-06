import test from 'node:test'
import assert from 'node:assert/strict'
import { addToParty, damaged, experienceForLevel, hasAbleCreature, healed, isFainted, isMoveInput, isParty, isSpeciesInput, MAX_PARTY, maxHpAt, movesAtLevel, newCreature, newMove, newSpecies, starterParty, statAt } from './creature'

const tackle = newMove('tackle', 'Tackle')
const growl = newMove('growl', 'Growl', 0)
const sprout = newSpecies('sprout', 'Sprout', ['grass'], { hp: 45, attack: 49, defense: 49, specialAttack: 65, specialDefense: 65, speed: 45 }, [
    { level: 1, moveId: tackle.id },
    { level: 3, moveId: growl.id },
    { level: 7, moveId: 'vine' },
    { level: 9, moveId: 'leech' },
    { level: 13, moveId: 'razor' },
])

test('a new creature starts at the authored level with full HP, its experience at the threshold, and the moves learnt by then', () => {
    const five = newCreature(sprout, 5)

    assert.equal(five.level, 5)
    assert.equal(five.hp, maxHpAt(sprout, 5))
    assert.equal(five.hp, Math.floor(45 * 5 / 50) + 5 + 5 + 10, 'our own plain rule')
    assert.equal(five.experience, experienceForLevel(5))
    assert.equal(five.experience, 125)
    assert.deepEqual(five.moves, ['tackle', 'growl'])
    assert.equal(isFainted(five), false)
})

test('the move list holds the last four learnt, and a repeated move is listed once', () => {
    assert.deepEqual(movesAtLevel(sprout, 13), ['growl', 'vine', 'leech', 'razor'])
    assert.deepEqual(movesAtLevel(sprout, 1), ['tackle'])
    assert.deepEqual(movesAtLevel({ ...sprout, learnset: [{ level: 1, moveId: 'tackle' }, { level: 2, moveId: 'tackle' }] }, 5), ['tackle'])
})

test('levels are clamped to 1–100 and stats grow with level', () => {
    assert.equal(newCreature(sprout, 0).level, 1)
    assert.equal(newCreature(sprout, 250).level, 100)
    assert.ok(statAt(49, 50) > statAt(49, 5))
    assert.equal(statAt(50, 50), 55)
})

test('a party rejects a seventh creature', () => {
    let party = starterParty({ speciesId: 'sprout', level: 5 }, [sprout])

    assert.equal(party.length, 1)

    for (let i = 1; i < MAX_PARTY; i++) {
        const bigger = addToParty(party, newCreature(sprout, 5))

        assert.ok(bigger !== undefined)
        party = bigger
    }

    assert.equal(party.length, 6)
    assert.equal(addToParty(party, newCreature(sprout, 5)), undefined, 'the seventh is refused')
})

test('damage floors at zero, a fainted creature is counted, and healing restores max HP', () => {
    const hurt = damaged(newCreature(sprout, 5), 7)

    assert.equal(hurt.hp, maxHpAt(sprout, 5) - 7)

    const down = damaged(hurt, 999)

    assert.equal(down.hp, 0)
    assert.equal(isFainted(down), true)
    assert.equal(hasAbleCreature([down]), false)
    assert.equal(hasAbleCreature([down, hurt]), true)
    assert.equal(healed(down, sprout).hp, maxHpAt(sprout, 5))
})

test('no starter, or a starter whose species is gone, gives an empty party', () => {
    assert.deepEqual(starterParty(null, [sprout]), [])
    assert.deepEqual(starterParty({ speciesId: 'missing', level: 5 }, [sprout]), [])
})

test('species and move bodies are checked, and a party read from a save too', () => {
    const { id: _id, ...body } = sprout

    assert.equal(isSpeciesInput(body), true)
    assert.equal(isSpeciesInput({ ...body, types: [] }), false)
    assert.equal(isSpeciesInput({ ...body, types: ['a', 'b', 'c'] }), false)
    assert.equal(isSpeciesInput({ ...body, baseStats: { ...body.baseStats, speed: -1 } }), false)
    assert.equal(isSpeciesInput({ ...body, learnset: [{ level: 0, moveId: 'x' }] }), false)
    assert.equal(isMoveInput({ name: 'Tackle', power: 40, accuracy: 100, type: 'normal' }), true)
    assert.equal(isMoveInput({ name: 'Tackle', power: 40, accuracy: 101, type: 'normal' }), false)
    assert.equal(isMoveInput({ name: '', power: 40, accuracy: 100, type: 'normal' }), false)
    assert.equal(isParty([newCreature(sprout, 5)]), true)
    assert.equal(isParty([{ speciesId: 'sprout', level: 5, hp: 20, experience: 125, moves: ['a', 'b', 'c', 'd', 'e'] }]), false, 'five moves')
    assert.equal(isParty(new Array(7).fill(newCreature(sprout, 5))), false)
})
