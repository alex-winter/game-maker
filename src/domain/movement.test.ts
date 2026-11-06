import test from 'node:test'
import assert from 'node:assert/strict'
import {
    advanceStep,
    beginStep,
    insideMap,
    newPlayer,
    playerPixel,
    RUN_MS_PER_CELL,
    stepPlayer,
    WALK_MS_PER_CELL,
} from './movement'

const size = { width: 4, height: 3 }
const canEnter = insideMap(size)

test('a step takes the authored duration and lands on the next cell', () => {
    let player = beginStep(newPlayer({ x: 1, y: 1 }), 'right', 100, canEnter)

    assert.deepEqual(player.step?.to, { x: 2, y: 1 })

    player = advanceStep(player, 50)
    assert.deepEqual(playerPixel(player), { x: 24, y: 16 })
    assert.deepEqual(player.cell, { x: 1, y: 1 })

    player = advanceStep(player, 50)
    assert.equal(player.step, null)
    assert.deepEqual(player.cell, { x: 2, y: 1 })
    assert.deepEqual(playerPixel(player), { x: 32, y: 16 })
})

test('a second press during a step turns the player but does not teleport', () => {
    let player = beginStep(newPlayer({ x: 1, y: 1 }), 'right', 100, canEnter)

    player = advanceStep(player, 30)
    player = beginStep(player, 'down', 100, canEnter)

    assert.equal(player.facing, 'down')
    assert.deepEqual(player.step?.to, { x: 2, y: 1 })
    assert.equal(player.step?.elapsedMs, 30)
})

test('facing changes even when the step cannot start', () => {
    const player = beginStep(newPlayer({ x: 0, y: 0 }, 'down'), 'left', 100, canEnter)

    assert.equal(player.facing, 'left')
    assert.equal(player.step, null)
    assert.deepEqual(player.cell, { x: 0, y: 0 })
})

test('holding a direction walks cell to cell and stops on the last in-bounds cell', () => {
    let player = newPlayer({ x: 1, y: 0 })
    const input = { direction: 'right' as const, running: false }

    for (let frame = 0; frame < 60; frame++) {
        player = stepPlayer(player, input, 16, canEnter)
    }

    assert.deepEqual(player.cell, { x: 3, y: 0 })
    assert.equal(player.step, null)
})

test('running crosses a cell in half the walk time', () => {
    const walk = stepPlayer(newPlayer({ x: 0, y: 0 }), { direction: 'right', running: false }, 0, canEnter)
    const run = stepPlayer(newPlayer({ x: 0, y: 0 }), { direction: 'right', running: true }, 0, canEnter)

    assert.equal(walk.step?.durationMs, WALK_MS_PER_CELL)
    assert.equal(run.step?.durationMs, RUN_MS_PER_CELL)
    assert.ok(RUN_MS_PER_CELL * 2 <= WALK_MS_PER_CELL)
})

test('a frame that overruns the step does not carry the extra time into the next one', () => {
    let player = stepPlayer(newPlayer({ x: 0, y: 0 }), { direction: 'right', running: false }, 0, canEnter)

    player = stepPlayer(player, { direction: 'right', running: false }, WALK_MS_PER_CELL + 500, canEnter)

    assert.deepEqual(player.cell, { x: 1, y: 0 })
    assert.equal(player.step?.elapsedMs, 0)
})
