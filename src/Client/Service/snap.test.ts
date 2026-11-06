import test from 'node:test'
import assert from 'node:assert/strict'
import { snap } from './snap'

const toCell = snap(16)

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
