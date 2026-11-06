import test from 'node:test'
import assert from 'node:assert/strict'
import { frameDelayMs } from './frame-delay'

test('60 fps rounds to 17 ms', () => {
    assert.equal(frameDelayMs(60), 17)
})

test('a missing fps is 30 fps, which is 33 ms', () => {
    assert.equal(frameDelayMs(undefined), 33)
})

test('zero, negative, infinite, and non-number values use the default', () => {
    assert.equal(frameDelayMs(0), 33)
    assert.equal(frameDelayMs(-5), 33)
    assert.equal(frameDelayMs(Infinity), 33)
    assert.equal(frameDelayMs(NaN), 33)
    assert.equal(frameDelayMs('60'), 33)
    assert.equal(frameDelayMs(null), 33)
})

test('other rates divide a second', () => {
    assert.equal(frameDelayMs(10), 100)
    assert.equal(frameDelayMs(120), 8)
})
