import test from 'node:test'
import assert from 'node:assert/strict'
import { cellInFront, interactionAt, resolveInteraction } from './interact'
import { beginStep, newPlayer } from './movement'
import { MapEvent, newSign, newWarp } from './warp'

const at = { x: 4, y: 4 }
const front = { x: 4, y: 3 }
const sign = newSign('sign', front, 'dialog-1')
const item: MapEvent = { kind: 'item', id: 'item', cell: front, itemId: 'potion', flagId: 'took-potion', metatileId: null }
const npc: MapEvent = { kind: 'npc', id: 'npc-event', cell: front, name: 'Mom', spriteId: null, facing: 'down', dialogId: 'mom-hello' }

test('cellInFront follows each facing, and a stepping player looks past the step target', () => {
    assert.deepEqual(cellInFront(newPlayer(at, 'up')), { x: 4, y: 3 })
    assert.deepEqual(cellInFront(newPlayer(at, 'down')), { x: 4, y: 5 })
    assert.deepEqual(cellInFront(newPlayer(at, 'left')), { x: 3, y: 4 })
    assert.deepEqual(cellInFront(newPlayer(at, 'right')), { x: 5, y: 4 })
    assert.deepEqual(cellInFront(beginStep(newPlayer(at, 'right'), 'right', 100, () => true)), { x: 6, y: 4 })
})

test('an empty cell, or one with only a warp, resolves to nothing', () => {
    assert.equal(resolveInteraction(newPlayer(at, 'down'), [sign]), undefined)
    assert.equal(interactionAt([newWarp('w', front, 'm', { x: 0, y: 0 }, 'down')], front), undefined)
})

test('a sign in front resolves to its dialog', () => {
    assert.deepEqual(resolveInteraction(newPlayer(at, 'up'), [sign]), { kind: 'sign', eventId: 'sign', dialogId: 'dialog-1' })
})

test('two events on one cell: the NPC answers before the item, and the item before the sign', () => {
    assert.equal(interactionAt([sign, item, npc], front)?.kind, 'npc')
    assert.equal(interactionAt([sign, item], front)?.kind, 'item')
    assert.deepEqual(interactionAt([item, sign], front), { kind: 'item', itemEventId: 'item' })
})
