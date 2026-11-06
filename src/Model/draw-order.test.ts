import test from 'node:test'
import assert from 'node:assert/strict'
import { drawOrder } from './draw-order'

test('a smaller order is in front', () => {
    assert.ok(drawOrder({ order: 0 }) > drawOrder({ order: 1 }))
})

test('sorting ascending by drawOrder paints the back first', () => {
    const layers = [{ order: 0 }, { order: 2 }, { order: 1 }]

    const backToFront = [...layers].sort((a, b) => drawOrder(a) - drawOrder(b))

    assert.deepEqual(backToFront.map(l => l.order), [2, 1, 0])
})
