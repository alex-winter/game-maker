import test from 'node:test'
import assert from 'node:assert/strict'
import { rectContainsPoint } from './rect-contains'

const rect = { x: 32, y: 48, width: 32, height: 16 }

test('contains its origin and interior points', () => {
    assert.equal(rectContainsPoint(rect, { x: 32, y: 48 }), true)
    assert.equal(rectContainsPoint(rect, { x: 48, y: 48 }), true)
    assert.equal(rectContainsPoint(rect, { x: 63, y: 63 }), true)
})

test('the far edges are exclusive', () => {
    assert.equal(rectContainsPoint(rect, { x: 64, y: 48 }), false)
    assert.equal(rectContainsPoint(rect, { x: 32, y: 64 }), false)
})

test('points before the origin are outside', () => {
    assert.equal(rectContainsPoint(rect, { x: 16, y: 48 }), false)
    assert.equal(rectContainsPoint(rect, { x: 32, y: 32 }), false)
})
