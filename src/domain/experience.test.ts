import test from 'node:test'
import assert from 'node:assert/strict'
import { experienceYield, gainExperience, growthLines, levelForExperience } from './experience'
import { experienceForLevel, maxHpAt, newCreature, newSpecies } from './creature'

const flat = { hp: 50, attack: 50, defense: 50, specialAttack: 50, specialDefense: 50, speed: 50 }
const sprout = newSpecies('sprout', 'Sprout', ['grass'], flat, [
    { level: 1, moveId: 'tackle' },
    { level: 6, moveId: 'ember' },
    { level: 7, moveId: 'leaf' },
])

test('the curve is level³: a creature levels from 5 to 6 at 216 points and not one point below', () => {
    assert.equal(experienceForLevel(5), 125)
    assert.equal(experienceForLevel(6), 216)
    assert.equal(levelForExperience(215), 5)
    assert.equal(levelForExperience(216), 6)

    const five = newCreature(sprout, 5)

    assert.equal(five.experience, 125)

    const short = gainExperience(five, sprout, 90)

    assert.equal(short.creature.experience, 215)
    assert.equal(short.creature.level, 5, 'one point short')
    assert.deepEqual(short.levelUps, [])

    const exact = gainExperience(five, sprout, 91)

    assert.equal(exact.creature.level, 6, 'at the threshold')
    assert.equal(exact.levelUps.length, 1)
    assert.equal(exact.levelUps[0]?.level, 6)
})

test('a level up refills HP to the new maximum and adds the learnset move for that level when a slot is free', () => {
    const hurt = { ...newCreature(sprout, 5), hp: 3 }
    const grown = gainExperience(hurt, sprout, 91)

    assert.equal(grown.creature.hp, maxHpAt(sprout, 6), 'refilled at the new level')
    assert.deepEqual(grown.creature.moves, ['tackle', 'ember'], 'Ember learned at 6')
    assert.deepEqual(grown.levelUps[0]?.learned, ['ember'])
    assert.deepEqual(grown.levelUps[0]?.skipped, [])
})

test('with every slot taken the move is skipped and said so; two levels at once offer each level in turn', () => {
    const full = { ...newCreature(sprout, 5), moves: ['a', 'b', 'c', 'd'] }
    const grown = gainExperience(full, sprout, experienceForLevel(7) - experienceForLevel(5))

    assert.equal(grown.creature.level, 7)
    assert.deepEqual(grown.creature.moves, ['a', 'b', 'c', 'd'], 'nothing displaced')
    assert.deepEqual(grown.levelUps.map(levelUp => [levelUp.level, levelUp.skipped]), [[6, ['ember']], [7, ['leaf']]])

    const lines = growthLines('Sprout', 218, grown, moveId => ({ ember: 'Ember', leaf: 'Leaf Cutter' })[moveId] ?? moveId)

    assert.deepEqual(lines, [
        'SPROUT gained 218 EXP. Points!',
        'SPROUT grew to Lv6!',
        'SPROUT wants to learn EMBER, but has no room.',
        'SPROUT grew to Lv7!',
        'SPROUT wants to learn LEAF CUTTER, but has no room.',
    ])
})

test('a win yields twelve points per level of the foe; a creature at the cap gains numbers and nothing else', () => {
    assert.equal(experienceYield(3), 36)
    assert.equal(experienceYield(0), 12, 'never less than one level of points')

    const capped = gainExperience(newCreature(sprout, 100), sprout, 1000)

    assert.equal(capped.creature.level, 100)
    assert.deepEqual(capped.levelUps, [])
    assert.equal(capped.creature.experience, 1000000 + 1000)
})
