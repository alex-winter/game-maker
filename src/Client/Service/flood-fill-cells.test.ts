import test from 'node:test'
import assert from 'node:assert/strict'
import { floodFillCells } from './flood-fill-cells'

const bounds4x4 = { minX: 0, minY: 0, maxX: 64, maxY: 64 }
const key = (c: { x: number, y: number }) => `${c.x},${c.y}`

test('an empty 4x4 area fills all 16 cells', () => {
    const cells = floodFillCells({ x: 16, y: 16 }, bounds4x4, 16, () => undefined)

    assert.equal(cells.length, 16)
    assert.equal(new Set(cells.map(key)).size, 16)
})

test('a wall of a different image stops the fill', () => {
    const wall = new Set(['32,0', '32,16', '32,32', '32,48'])
    const cells = floodFillCells({ x: 0, y: 0 }, bounds4x4, 16, c => wall.has(key(c)) ? 'wall' : undefined)

    assert.equal(cells.length, 8)
    assert.ok(cells.every(c => c.x < 32))
})

test('filling a region of one image selects only that image', () => {
    const grass = new Set(['0,0', '16,0', '0,16'])
    const cells = floodFillCells({ x: 0, y: 0 }, bounds4x4, 16, c => grass.has(key(c)) ? 'grass' : undefined)

    assert.deepEqual(new Set(cells.map(key)), grass)
})

test('a start outside the bounds fills nothing', () => {
    assert.deepEqual(floodFillCells({ x: 64, y: 0 }, bounds4x4, 16, () => undefined), [])
})
