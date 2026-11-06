import test from 'node:test'
import assert from 'node:assert/strict'
import { pointerToWorld } from './pointer-to-world'

test('subtracts the element origin before adding the camera', () => {
    const world = pointerToWorld(
        { clientX: 400, clientY: 100 },
        { left: 340, top: 38 },
        { x: 0, y: 0, zoom: 1 },
    )

    assert.deepEqual(world, { x: 60, y: 62 })
})

test('a panned camera shifts the world point by the same amount', () => {
    const world = pointerToWorld(
        { clientX: 400, clientY: 100 },
        { left: 340, top: 38 },
        { x: 1000, y: -50, zoom: 1 },
    )

    assert.deepEqual(world, { x: 1060, y: 12 })
})

test('an element at the viewport origin is the identity plus the camera', () => {
    const world = pointerToWorld(
        { clientX: 17, clientY: 33 },
        { left: 0, top: 0 },
        { x: 16, y: 16, zoom: 1 },
    )

    assert.deepEqual(world, { x: 33, y: 49 })
})

test('zoom divides the screen distance into world pixels', () => {
    const world = pointerToWorld(
        { clientX: 64, clientY: 32 },
        { left: 0, top: 0 },
        { x: 100, y: 100, zoom: 4 },
    )

    assert.deepEqual(world, { x: 116, y: 108 })
})
