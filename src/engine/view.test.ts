import test from 'node:test'
import assert from 'node:assert/strict'
import { clampZoom, screenToWorld, viewRect, worldToScreen, zoomedAt } from './view'

const port = { width: 320, height: 240, clear(): void { }, drawImage(): void { } }

test('viewRect shows fewer world pixels as zoom grows', () => {
    assert.deepEqual(viewRect(port, { x: 10, y: 20, zoom: 1 }), { x: 10, y: 20, width: 320, height: 240 })
    assert.deepEqual(viewRect(port, { x: 10, y: 20, zoom: 4 }), { x: 10, y: 20, width: 80, height: 60 })
})

test('worldToScreen and screenToWorld invert each other at integer zoom', () => {
    const view = { x: 100, y: 50, zoom: 3 }
    const screen = worldToScreen(view, { x: 116, y: 66 })

    assert.deepEqual(screen, { x: 48, y: 48 })
    assert.deepEqual(screenToWorld(view, screen), { x: 116, y: 66 })
})

test('clampZoom keeps zoom an integer between 1 and 4', () => {
    assert.equal(clampZoom(0), 1)
    assert.equal(clampZoom(2.6), 3)
    assert.equal(clampZoom(9), 4)
})

test('zoomedAt keeps the world point under the anchor fixed', () => {
    const view = { x: 0, y: 0, zoom: 1 }
    const anchor = { x: 160, y: 120 }
    const before = screenToWorld(view, anchor)
    const zoomed = zoomedAt(view, 2, anchor)

    assert.equal(zoomed.zoom, 2)
    assert.deepEqual(screenToWorld(zoomed, anchor), before)
    assert.deepEqual(zoomed, { x: 80, y: 60, zoom: 2 })
})
