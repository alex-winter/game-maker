import test from 'node:test'
import assert from 'node:assert/strict'
import { rectContainsPoint, rectsIntersect } from './rect'

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

test('overlapping rectangles intersect', () => {
    assert.equal(rectsIntersect(rect, { x: 40, y: 40, width: 16, height: 16 }), true)
    assert.equal(rectsIntersect(rect, { x: 0, y: 0, width: 33, height: 49 }), true)
})

test('rectangles that only touch along an edge do not intersect', () => {
    assert.equal(rectsIntersect(rect, { x: 64, y: 48, width: 16, height: 16 }), false)
    assert.equal(rectsIntersect(rect, { x: 32, y: 64, width: 16, height: 16 }), false)
    assert.equal(rectsIntersect(rect, { x: 0, y: 0, width: 32, height: 48 }), false)
})
