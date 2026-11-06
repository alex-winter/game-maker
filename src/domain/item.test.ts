import test from 'node:test'
import assert from 'node:assert/strict'
import { hasFlag, newMemory } from './flags'
import { addToBag, bagCount, isBag, isItemInput, isTaken, newBag, pickUp } from './item'
import { newItemEvent } from './warp'

const potionOnTheFloor = newItemEvent('e1', { x: 3, y: 4 }, 'potion', 'took-potion', 7)

test('the first interact adds the item and sets the flag; the second does not add it again', () => {
    const first = pickUp(newBag(), newMemory(), potionOnTheFloor)

    assert.equal(first.alreadyTaken, false)
    assert.equal(bagCount(first.bag, 'potion'), 1)
    assert.equal(hasFlag(first.memory, 'took-potion'), true)
    assert.equal(isTaken(potionOnTheFloor, first.memory), true)

    const second = pickUp(first.bag, first.memory, potionOnTheFloor)

    assert.equal(second.alreadyTaken, true)
    assert.equal(bagCount(second.bag, 'potion'), 1)
    assert.equal(second.bag, first.bag, 'nothing changed')
})

test('the bag stacks the same item and keeps first-found order', () => {
    let bag = addToBag(newBag(), 'potion')

    bag = addToBag(bag, 'antidote')
    bag = addToBag(bag, 'potion', 2)

    assert.deepEqual(bag, [{ itemId: 'potion', count: 3 }, { itemId: 'antidote', count: 1 }])
    assert.equal(bagCount(bag, 'rope'), 0)
})

test('isItemInput and isBag guard the API and a save', () => {
    assert.equal(isItemInput({ name: 'Potion', description: 'Heals 20 HP.' }), true)
    assert.equal(isItemInput({ name: ' ', description: '' }), false)
    assert.equal(isItemInput({ name: 'Potion' }), false)
    assert.equal(isBag([{ itemId: 'potion', count: 2 }]), true)
    assert.equal(isBag([{ itemId: 'potion', count: 1.5 }]), false)
    assert.equal(isBag({}), false)
})
