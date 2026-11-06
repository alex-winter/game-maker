import test from 'node:test'
import assert from 'node:assert/strict'
import { cellToPixel, GRID_SIZE, pixelToCell, snap, snapToGrid } from './grid'

const toCell = snap(16)

test('the grid is 16 pixels', () => {
    assert.equal(GRID_SIZE, 16)
})

test('floors to the cell origin, so a half-tile edge snaps down', () => {
    assert.equal(toCell(0), 0)
    assert.equal(toCell(15), 0)
    assert.equal(toCell(16), 16)
    assert.equal(toCell(24), 16)
    assert.equal(toCell(31.9), 16)
})

test('negative values floor toward the lower cell', () => {
    assert.equal(toCell(-1), -16)
    assert.equal(toCell(-16), -16)
    assert.equal(toCell(-17), -32)
})

test('snapToGrid uses the grid size', () => {
    assert.equal(snapToGrid(47), 32)
})

test('pixelToCell and cellToPixel are inverse on cell origins', () => {
    assert.deepEqual(pixelToCell({ x: 47, y: 16 }), { x: 2, y: 1 })
    assert.deepEqual(pixelToCell({ x: -1, y: 0 }), { x: -1, y: 0 })
    assert.deepEqual(cellToPixel({ x: 2, y: 1 }), { x: 32, y: 16 })
})
