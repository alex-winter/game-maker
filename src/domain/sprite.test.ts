import test from 'node:test'
import assert from 'node:assert/strict'
import { isSpriteDefinitionInput, newSpriteDefinition, pickFrame, withFrame, withoutWalkFrame } from './sprite'

const frame = (x: number) => ({ x, y: 0, width: 16, height: 32 })

const twoStep = withFrame(
    withFrame(newSpriteDefinition('s', 'Hero', 'sheet', 16, 32), 'left', 0, frame(16)),
    'left', 1, frame(32),
)

test('two walk frames: phase 0.2 picks the first and 0.7 the second', () => {
    assert.deepEqual(pickFrame(twoStep, 'left', 0.2, false), frame(16))
    assert.deepEqual(pickFrame(twoStep, 'left', 0.7, false), frame(32))
})

test('standing shows the idle frame, as does a direction without a walk cycle', () => {
    assert.deepEqual(pickFrame(twoStep, 'left', 0.7, true), frame(0))
    assert.deepEqual(pickFrame(twoStep, 'up', 0.7, false), frame(0))
})

test('a phase at the very end still lands on the last frame', () => {
    assert.deepEqual(pickFrame(twoStep, 'left', 1, false), frame(32))
})

test('frames can be replaced, appended, and removed per direction', () => {
    const replaced = withFrame(twoStep, 'left', 1, frame(48))
    const appended = withFrame(twoStep, 'left', 9, frame(64))
    const idle = withFrame(twoStep, 'left', 'idle', frame(80))

    assert.deepEqual(replaced.directions.left.walk, [frame(16), frame(48)])
    assert.deepEqual(appended.directions.left.walk, [frame(16), frame(32), frame(64)])
    assert.deepEqual(idle.directions.left.idle, frame(80))
    assert.deepEqual(withoutWalkFrame(twoStep, 'left', 0).directions.left.walk, [frame(32)])
    assert.deepEqual(twoStep.directions.right.walk, [])
})

test('the server accepts a full definition and refuses a broken one', () => {
    const { id: _id, ...input } = twoStep

    assert.equal(isSpriteDefinitionInput(input), true)
    assert.equal(isSpriteDefinitionInput({ ...input, frameWidth: 0 }), false)
    assert.equal(isSpriteDefinitionInput({ ...input, directions: { down: input.directions.down } }), false)
    assert.equal(isSpriteDefinitionInput({ ...input, directions: { ...input.directions, up: { idle: null, walk: [] } } }), false)
})
