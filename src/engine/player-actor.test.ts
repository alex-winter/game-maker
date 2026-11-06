import test from 'node:test'
import assert from 'node:assert/strict'
import { advanceStep, beginStep, newPlayer } from '../domain/movement'
import { newSpriteDefinition, withFrame } from '../domain/sprite'
import { playerActor } from './player-actor'

const sprite = withFrame(
    withFrame(newSpriteDefinition('s', 'Hero', 'sheet', 16, 32), 'left', 0, { x: 16, y: 0, width: 16, height: 32 }),
    'left', 1, { x: 32, y: 0, width: 16, height: 32 },
)

test('without a sprite the player is one red cell at its pixel position', () => {
    const actor = playerActor(newPlayer({ x: 2, y: 3 }), undefined, undefined)

    assert.deepEqual(actor, { x: 32, y: 48, width: 16, height: 16, color: '#ff5252' })
})

test('a 16×32 sprite stands on its cell and shows the walk frame for the step phase', () => {
    let player = beginStep(newPlayer({ x: 2, y: 3 }), 'left', 100, () => true)

    player = advanceStep(player, 70)

    const actor = playerActor(player, sprite, 'img')

    assert.equal(actor.y, 48 + 16 - 32)
    assert.equal(actor.x, 32 - 16 * 0.7)
    assert.equal(actor.height, 32)
    assert.deepEqual(actor.sprite, { image: 'img', sx: 32, sy: 0, sw: 16, sh: 32 })
})

test('standing shows the idle frame for the facing', () => {
    const actor = playerActor(newPlayer({ x: 0, y: 0 }, 'left'), sprite, 'img')

    assert.equal(actor.sprite?.sx, 0)
})
