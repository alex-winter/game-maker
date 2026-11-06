import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_FRAME_MS, frameAt, frameCount, isMetatileAttributes, isTilesetInput, Metatile, metatileById, sliceSheet, withAddedFrame, withMetatileAttributes } from './tileset'

test('slicing a 48×32 sheet gives 3×2 metatiles in row-major order from id 1', () => {
    const tileset = sliceSheet('Town', 'sheet', 48, 32)

    assert.equal(tileset.metatiles.length, 6)
    assert.deepEqual(tileset.metatiles.map(m => m.id), [1, 2, 3, 4, 5, 6])
    assert.deepEqual(
        tileset.metatiles.map(m => [m.x, m.y]),
        [[0, 0], [16, 0], [32, 0], [0, 16], [16, 16], [32, 16]],
    )
    assert.ok(tileset.metatiles.every(m => m.w === 16 && m.h === 16 && m.sheetId === 'sheet' && !m.solid))
})

test('a partial edge row or column is dropped', () => {
    assert.equal(sliceSheet('t', 's', 40, 20).metatiles.length, 2)
    assert.equal(sliceSheet('t', 's', 15, 15).metatiles.length, 0)
})

test('marking a metatile solid changes only that one and does not mutate', () => {
    const tileset = sliceSheet('t', 's', 32, 16)
    const marked = withMetatileAttributes(tileset, 2, { solid: true, elevation: 3 })

    assert.equal(metatileById(marked, 2)?.solid, true)
    assert.equal(metatileById(marked, 2)?.elevation, 3)
    assert.equal(metatileById(marked, 1)?.solid, false)
    assert.equal(metatileById(tileset, 2)?.solid, false)
    assert.deepEqual(withMetatileAttributes(tileset, 99, { solid: true }), tileset)
})

test('attribute bodies are checked field by field', () => {
    assert.equal(isMetatileAttributes({ solid: true }), true)
    assert.equal(isMetatileAttributes({ elevation: 2, ledge: 'down' }), true)
    assert.equal(isMetatileAttributes({ ledge: null }), true)
    assert.equal(isMetatileAttributes({ solid: 'yes' }), false)
    assert.equal(isMetatileAttributes({ elevation: -1 }), false)
    assert.equal(isMetatileAttributes({ ledge: 'sideways' }), false)
    assert.equal(isMetatileAttributes({ x: 5 }), false)
    assert.equal(isMetatileAttributes(null), false)
})

test('a tileset body needs a name and well-formed metatiles with unique ids', () => {
    const good = sliceSheet('Town', 'sheet', 32, 16)

    assert.equal(isTilesetInput({ name: good.name, metatiles: good.metatiles }), true)
    assert.equal(isTilesetInput({ name: ' ', metatiles: good.metatiles }), false)
    assert.equal(isTilesetInput({ name: 'x', metatiles: [...good.metatiles, good.metatiles[0]] }), false)
    assert.equal(isTilesetInput({ name: 'x', metatiles: [{ id: 0 }] }), false)
})

test('frameAt crosses from frame 0 to frame 1 exactly at the authored duration and cycles back round', () => {
    const still = sliceSheet('t', 's', 48, 16).metatiles[0]
    const water = { ...still, animation: { frames: [{ x: 16, y: 0 }, { x: 32, y: 0 }], frameMs: 250 } }

    assert.deepEqual(frameAt(water, 0), { x: 0, y: 0, width: 16, height: 16 })
    assert.deepEqual(frameAt(water, 249), { x: 0, y: 0, width: 16, height: 16 }, 'still frame 0 a hair before the boundary')
    assert.deepEqual(frameAt(water, 250), { x: 16, y: 0, width: 16, height: 16 }, 'frame 1 at the boundary')
    assert.equal(frameAt(water, 500).x, 32)
    assert.equal(frameAt(water, 750).x, 0, 'back round')
    assert.equal(frameAt(water, 250 * 301 + 1).x, 16, 'much later still in step: 301 frames in is frame 1')
    assert.equal(frameCount(water), 3)

    assert.deepEqual(frameAt(still, 999999), { x: 0, y: 0, width: 16, height: 16 }, 'a still tile never changes')
    assert.equal(frameCount(still), 1)
})

test('adding frames builds an animation at the default rate, and animation: null takes it away', () => {
    const tileset = sliceSheet('t', 's', 48, 16)
    const first = withAddedFrame(tileset.metatiles[0], { x: 16, y: 0 })

    assert.deepEqual(first, { frames: [{ x: 16, y: 0 }], frameMs: DEFAULT_FRAME_MS })

    const animated = withMetatileAttributes(tileset, 1, { animation: first })
    const second = withAddedFrame(metatileById(animated, 1) as Metatile, { x: 32, y: 0 })

    assert.deepEqual(second.frames, [{ x: 16, y: 0 }, { x: 32, y: 0 }])

    const slowed = withMetatileAttributes(animated, 1, { animation: { ...first, frameMs: 500 }, solid: true })

    assert.equal(metatileById(slowed, 1)?.animation?.frameMs, 500)
    assert.equal(metatileById(slowed, 1)?.solid, true)

    const cleared = withMetatileAttributes(slowed, 1, { animation: null })

    assert.equal('animation' in (metatileById(cleared, 1) as Metatile), false)
    assert.equal(metatileById(cleared, 1)?.solid, true, 'other attributes stay')
})

test('animation bodies are checked: frames are non-negative points and frameMs a positive whole number', () => {
    assert.equal(isMetatileAttributes({ animation: null }), true)
    assert.equal(isMetatileAttributes({ animation: { frames: [{ x: 16, y: 0 }], frameMs: 250 } }), true)
    assert.equal(isMetatileAttributes({ animation: { frames: [{ x: -16, y: 0 }], frameMs: 250 } }), false)
    assert.equal(isMetatileAttributes({ animation: { frames: [], frameMs: 0 } }), false)
    assert.equal(isMetatileAttributes({ animation: { frames: 'two', frameMs: 250 } }), false)
    assert.equal(isTilesetInput({ name: 't', metatiles: [{ id: 1, sheetId: 's', x: 0, y: 0, w: 16, h: 16, solid: false, elevation: 0, ledge: null, animation: { frames: [{ x: 16, y: 0 }], frameMs: 100 } }] }), true)
    assert.equal(isTilesetInput({ name: 't', metatiles: [{ id: 1, sheetId: 's', x: 0, y: 0, w: 16, h: 16, solid: false, elevation: 0, ledge: null, animation: { frames: [], frameMs: -1 } }] }), false)
})
