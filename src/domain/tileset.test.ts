import test from 'node:test'
import assert from 'node:assert/strict'
import { isMetatileAttributes, isTilesetInput, metatileById, sliceSheet, withMetatileAttributes } from './tileset'

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
