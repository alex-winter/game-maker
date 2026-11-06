import test from 'node:test'
import assert from 'node:assert/strict'
import { CanEnter, WALK_MS_PER_CELL } from './movement'
import { isNpcBehavior, newNpcEvent } from './warp'
import { MIN_PAUSE_MS, newNpcMotion, NpcMotion, tickNpcMotion, WANDER_RADIUS, withinLeash } from './npc-behavior'

/** Hands out the given numbers in turn, then repeats. */
function sequence(values: readonly number[]): () => number {
    let index = 0

    return () => values[index++ % values.length]
}

const open: CanEnter = () => true

const mom = newNpcEvent('mom', { x: 5, y: 5 }, 'Mom', null, 'down', null, 'wander')

function tick(motion: NpcMotion, behavior: 'still' | 'look' | 'wander', ms: number, canEnter: CanEnter, random: () => number): NpcMotion {
    for (let t = 0; t < ms; t += 16) {
        motion = tickNpcMotion(motion, behavior, 16, canEnter, random)
    }

    return motion
}

test('still never moves or turns, however long it waits', () => {
    const rested = tick(newNpcMotion(mom), 'still', 10000, open, sequence([0.9]))

    assert.deepEqual(rested.mover, { cell: { x: 5, y: 5 }, facing: 'down', step: null })
})

test('look turns in place when its pause runs out and never steps', () => {
    const motion = newNpcMotion(mom)
    const waiting = tick(motion, 'look', MIN_PAUSE_MS - 16, open, sequence([0.6]))

    assert.equal(waiting.mover.facing, 'down', 'still waiting')

    const turned = tick(waiting, 'look', 32, open, sequence([0.6, 0]))

    assert.equal(turned.mover.facing, 'left', '0.6 of four directions is the third: left')
    assert.equal(turned.mover.step, null)
    assert.deepEqual(turned.mover.cell, { x: 5, y: 5 })
    assert.equal(turned.pauseMs, MIN_PAUSE_MS - 16, 'a fresh pause from the second number, one frame in')
})

test('wander with a stub RNG never chooses a solid cell and only turns toward one', () => {
    // Everything but the row y=5 is solid, and x=7 on that row is a rock.
    const canEnter: CanEnter = (_from, to) => to.y === 5 && to.x !== 7
    const visited: { x: number; y: number }[] = []
    let motion = newNpcMotion(mom)
    // up, right, down, right, left, up... cycle through every direction with short pauses.
    const random = sequence([0.1, 0, 0.8, 0, 0.3, 0, 0.8, 0, 0.6, 0, 0.1, 0])

    for (let t = 0; t < 30000; t += 16) {
        motion = tickNpcMotion(motion, 'wander', 16, canEnter, random)
        visited.push(motion.mover.cell)
        if (motion.mover.step !== null) visited.push(motion.mover.step.to)
    }

    assert.ok(visited.every(cell => canEnter({ x: 0, y: 0 }, cell)), 'never stood on or stepped toward a solid cell')
    assert.ok(visited.every(cell => withinLeash(mom.cell, cell)), 'kept within the leash')
    assert.ok(visited.some(cell => cell.x !== 5), 'did actually walk')
    assert.ok(visited.every(cell => cell.x !== 7), 'the rock was never entered')
})

test('a refused wander step still turns the person that way, and the leash holds them near home', () => {
    let motion = newNpcMotion(mom)

    motion = tick(motion, 'wander', MIN_PAUSE_MS + 16, () => false, sequence([0.1, 0]))
    assert.equal(motion.mover.facing, 'up', 'faced the wall')
    assert.equal(motion.mover.step, null, 'did not walk into it')

    // Always right, no pause worth mentioning: walks until the leash stops it.
    motion = tick(newNpcMotion(mom), 'wander', (MIN_PAUSE_MS + WALK_MS_PER_CELL) * 6, open, sequence([0.8, 0]))
    assert.equal(motion.mover.cell.x, 5 + WANDER_RADIUS)
    assert.equal(motion.mover.step, null)
})

test('isNpcBehavior accepts the three behaviors only', () => {
    assert.equal(isNpcBehavior('wander'), true)
    assert.equal(isNpcBehavior('run'), false)
    assert.equal(isNpcBehavior(undefined), false)
})
