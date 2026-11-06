import test from 'node:test'
import assert from 'node:assert/strict'
import { directionFromKeys } from './direction-from-keys'

const none = { up: false, down: false, left: false, right: false }

test('no keys is no movement', () => {
    assert.deepEqual(directionFromKeys(none), { x: 0, y: 0 })
})

test('one arrow moves one axis', () => {
    assert.deepEqual(directionFromKeys({ ...none, right: true }), { x: 1, y: 0 })
    assert.deepEqual(directionFromKeys({ ...none, up: true }), { x: 0, y: -1 })
})

test('opposite arrows cancel', () => {
    assert.deepEqual(directionFromKeys({ ...none, left: true, right: true }), { x: 0, y: 0 })
})

test('diagonals combine both axes', () => {
    assert.deepEqual(directionFromKeys({ ...none, down: true, left: true }), { x: -1, y: 1 })
})
