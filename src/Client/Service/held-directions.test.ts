import test from 'node:test'
import assert from 'node:assert/strict'
import { HeldDirections } from './held-directions'

test('the newest press wins and releasing it falls back to the earlier one', () => {
    const held = new HeldDirections()

    assert.equal(held.latest(), null)

    held.press('right')
    held.press('up')
    assert.equal(held.latest(), 'up')

    held.release('up')
    assert.equal(held.latest(), 'right')

    held.release('right')
    assert.equal(held.latest(), null)
})

test('pressing a held direction again moves it to the front; clear drops everything', () => {
    const held = new HeldDirections()

    held.press('left')
    held.press('down')
    held.press('left')
    assert.equal(held.latest(), 'left')

    held.clear()
    assert.equal(held.latest(), null)
})
