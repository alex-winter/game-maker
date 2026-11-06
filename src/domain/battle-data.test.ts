import test from 'node:test'
import assert from 'node:assert/strict'
import { chartTypes, effectiveness, isDamageClass, isTypeChart, matchup, withMatchup, withMoveDefaults } from './battle-data'
import { newMove } from './creature'

const chart = {
    fire: { grass: 2, water: 0.5, fire: 0.5 },
    water: { fire: 2, grass: 0.5 },
    grass: { water: 2, fire: 0.5 },
    normal: { ghost: 0 },
    ghost: { normal: 0 },
}

test('a matchup is super effective, resisted, immune, or plain when the chart says nothing', () => {
    assert.equal(matchup(chart, 'fire', 'grass'), 2, 'super effective')
    assert.equal(matchup(chart, 'fire', 'water'), 0.5, 'resisted')
    assert.equal(matchup(chart, 'normal', 'ghost'), 0, 'immune')
    assert.equal(matchup(chart, 'fire', 'rock'), 1, 'missing defending type')
    assert.equal(matchup(chart, 'ice', 'grass'), 1, 'missing attacking type')
})

test('against two types the matchups multiply', () => {
    assert.equal(effectiveness(chart, 'fire', ['grass', 'water']), 1, '2 × 0.5')
    assert.equal(effectiveness(chart, 'fire', ['grass', 'grass']), 4)
    assert.equal(effectiveness(chart, 'normal', ['ghost', 'fire']), 0, 'immunity wins')
    assert.equal(effectiveness(chart, 'fire', []), 1)
})

test('withMatchup sets an entry, and ×1 removes it so the chart stays a list of exceptions', () => {
    const added = withMatchup(chart, 'ice', 'grass', 2)

    assert.equal(matchup(added, 'ice', 'grass'), 2)
    assert.equal(matchup(chart, 'ice', 'grass'), 1, 'the old chart is untouched')

    const plain = withMatchup(added, 'ice', 'grass', 1)

    assert.equal('ice' in plain, false, 'an empty row goes too')
    const { normal: _normal, ...withoutNormal } = chart

    assert.deepEqual(withMatchup(chart, 'normal', 'ghost', 1), withoutNormal, 'clearing the last entry of a row drops the row')
    assert.deepEqual(chartTypes(chart), ['fire', 'ghost', 'grass', 'normal', 'water'])
})

test('a chart is validated as names against the four multipliers; a move without a class is physical', () => {
    assert.equal(isTypeChart(chart), true)
    assert.equal(isTypeChart({}), true)
    assert.equal(isTypeChart({ fire: { grass: 3 } }), false, '×3 is not a multiplier')
    assert.equal(isTypeChart({ '': { grass: 2 } }), false)
    assert.equal(isTypeChart([]), false)
    assert.equal(isDamageClass('special'), true)
    assert.equal(isDamageClass('status'), false)

    const { damageClass: _dropped, ...stored } = newMove('ember', 'Ember', 40, 100, 'fire')

    assert.equal(withMoveDefaults(stored).damageClass, 'physical')
    assert.equal(withMoveDefaults({ ...stored, damageClass: 'special' }).damageClass, 'special')
    assert.equal(newMove('ember', 'Ember', 40, 100, 'fire', 'special').damageClass, 'special')
})
