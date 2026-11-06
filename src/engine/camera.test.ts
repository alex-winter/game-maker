import test from 'node:test'
import assert from 'node:assert/strict'
import { cameraFor, GBA_VIEW, integerScale } from './camera'

const map = { width: 640, height: 480 }

test('the player is centred in the open', () => {
    assert.deepEqual(cameraFor({ x: 328, y: 248 }, GBA_VIEW, map), { x: 208, y: 168 })
})

test('the camera stops at the left and top edges', () => {
    assert.deepEqual(cameraFor({ x: 8, y: 8 }, GBA_VIEW, map), { x: 0, y: 0 })
    assert.deepEqual(cameraFor({ x: 120, y: 80 }, GBA_VIEW, map), { x: 0, y: 0 })
    assert.deepEqual(cameraFor({ x: 121, y: 81 }, GBA_VIEW, map), { x: 1, y: 1 })
})

test('the camera stops at the right and bottom edges', () => {
    assert.deepEqual(cameraFor({ x: 632, y: 472 }, GBA_VIEW, map), { x: 400, y: 320 })
    assert.deepEqual(cameraFor({ x: 520, y: 400 }, GBA_VIEW, map), { x: 400, y: 320 })
    assert.deepEqual(cameraFor({ x: 519, y: 399 }, GBA_VIEW, map), { x: 399, y: 319 })
})

test('a map smaller than the view is centred on that axis, whatever the player does', () => {
    const small = { width: 160, height: 96 }

    assert.deepEqual(cameraFor({ x: 8, y: 8 }, GBA_VIEW, small), { x: -40, y: -32 })
    assert.deepEqual(cameraFor({ x: 150, y: 90 }, GBA_VIEW, small), { x: -40, y: -32 })

    const tall = { width: 160, height: 480 }

    assert.deepEqual(cameraFor({ x: 80, y: 240 }, GBA_VIEW, tall), { x: -40, y: 160 })
})

test('the scale is the largest integer that fits, never below 1', () => {
    assert.equal(integerScale({ width: 1920, height: 1080 }), 6)
    assert.equal(integerScale({ width: 720, height: 480 }), 3)
    assert.equal(integerScale({ width: 500, height: 480 }), 2)
    assert.equal(integerScale({ width: 200, height: 100 }), 1)
})
