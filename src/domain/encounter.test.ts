import test from 'node:test'
import assert from 'node:assert/strict'
import { emptyEncounterTable, EncounterTable, isEncounterTable, pickEntry, rollEncounter, wildAppearedText } from './encounter'

function sequence(values: readonly number[]): () => number {
    let index = 0

    return () => values[index++ % values.length]
}

const table: EncounterTable = {
    rate: 20,
    entries: [
        { speciesId: 'sprout', minLevel: 2, maxLevel: 4, weight: 60 },
        { speciesId: 'ember', minLevel: 3, maxLevel: 3, weight: 30 },
        { speciesId: 'rare', minLevel: 10, maxLevel: 12, weight: 10 },
    ],
}

test('a fixed RNG returns the weighted species and a level in its range', () => {
    // 0.1 → 10 < 20: something appears; 0.5 of 100 weight lands in sprout's 0–60; level 2 + floor(0.99 × 3) = 4.
    const sprout = rollEncounter(table, [], sequence([0.1, 0.5, 0.99]))

    assert.deepEqual(sprout, { party: [], speciesId: 'sprout', level: 4 })

    // 0.65 of 100 is past sprout (60) and inside ember (60–90).
    assert.equal(rollEncounter(table, [], sequence([0, 0.65, 0]))?.speciesId, 'ember')
    assert.equal(rollEncounter(table, [], sequence([0, 0.95, 0]))?.speciesId, 'rare')
    assert.equal(rollEncounter(table, [], sequence([0, 0.999999, 0.5]))?.level, 11)
})

test('the rate gates the roll: 0.2 of 100 is 20, not under 20, so the grass stays quiet', () => {
    assert.equal(rollEncounter(table, [], sequence([0.2, 0, 0])), null)
    assert.equal(rollEncounter(table, [], sequence([0.199, 0, 0]))?.speciesId, 'sprout')
    assert.equal(rollEncounter({ ...table, rate: 0 }, [], sequence([0, 0, 0])), null)
    assert.equal(rollEncounter(emptyEncounterTable(), [], sequence([0, 0, 0])), null, 'no lines, nothing appears')
})

test('a weight of 0 never encounters, and a single 0 line among others is skipped', () => {
    const never: EncounterTable = { rate: 100, entries: [{ speciesId: 'ghost', minLevel: 5, maxLevel: 5, weight: 0 }] }

    for (let roll = 0; roll < 1; roll += 0.05) {
        assert.equal(rollEncounter(never, [], sequence([0, roll, 0])), null)
    }

    const mixed = [{ speciesId: 'ghost', minLevel: 5, maxLevel: 5, weight: 0 }, { speciesId: 'sprout', minLevel: 5, maxLevel: 5, weight: 1 }]

    assert.equal(pickEntry(mixed, 0)?.speciesId, 'sprout')
    assert.equal(pickEntry(mixed, 0.999)?.speciesId, 'sprout')
    assert.equal(pickEntry(mixed, 1)?.speciesId, 'sprout', 'a roll of exactly 1 still lands on the last line')
})

test('the message names the species, or says the project lacks it', () => {
    assert.equal(wildAppearedText('Sprout'), 'A wild SPROUT appeared!')
    assert.match(wildAppearedText(undefined), /no such species/)
})

test('encounter tables are checked line by line', () => {
    assert.equal(isEncounterTable(table), true)
    assert.equal(isEncounterTable(emptyEncounterTable()), true)
    assert.equal(isEncounterTable({ rate: 101, entries: [] }), false)
    assert.equal(isEncounterTable({ rate: 10, entries: [{ speciesId: 'x', minLevel: 0, maxLevel: 5, weight: 1 }] }), false)
    assert.equal(isEncounterTable({ rate: 10, entries: [{ speciesId: 'x', minLevel: 1, maxLevel: 5, weight: -1 }] }), false)
    assert.equal(isEncounterTable({ rate: 10 }), false)
})
