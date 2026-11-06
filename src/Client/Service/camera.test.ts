import test from 'node:test'
import assert from 'node:assert/strict'
import { Camera } from './camera'

test('starts at the origin', () => {
    assert.deepEqual(new Camera().get(), { x: 0, y: 0 })
})

test('set replaces the position and get returns a copy', () => {
    const camera = new Camera()
    const saved = { x: 100, y: -20 }

    camera.set(saved)
    saved.x = 999

    const read = camera.get()
    read.y = 999

    assert.deepEqual(camera.get(), { x: 100, y: -20 })
})

test('panBy accumulates deltas', () => {
    const camera = new Camera()

    camera.panBy(10, 5)
    camera.panBy(-3, 5)

    assert.deepEqual(camera.get(), { x: 7, y: 10 })
})
