import test from 'node:test'
import assert from 'node:assert/strict'
import { insideMap, WALK_MS_PER_CELL } from '../domain/movement'
import { newWarp } from '../domain/warp'
import { FADE_MS, fadeOpacity } from './fade'
import { advanceField, FieldState, FieldWorld, isTransitioning, newField } from './field'

const town = { width: 10, height: 10 }
const house = { width: 6, height: 6 }
const door = newWarp('door', { x: 5, y: 4 }, 'house', { x: 3, y: 5 }, 'up')

const world: FieldWorld = {
    sizeOf: id => (id === 'town' ? town : id === 'house' ? house : undefined),
    canEnter: id => insideMap(id === 'town' ? town : house),
    isSolidAt: () => false,
    connectionsOf: id => (id === 'town' ? { south: { mapId: 'house', offset: -2 } } : {}),
    eventsOf: id => (id === 'town' ? [door] : []),
}

const right = { direction: 'right' as const, running: false }
const up = { direction: 'up' as const, running: false }
const none = { direction: null, running: false }

function run(state: FieldState, input: { direction: 'up' | 'down' | 'left' | 'right' | null; running: boolean }, ms: number, step = 16): FieldState {
    for (let t = 0; t < ms; t += step) {
        state = advanceField(state, input, step, world)
    }

    return state
}

test('stepping onto the door starts a fade, swaps the map when the screen is black, and lands on the warp cell', () => {
    let state = newField('town', { x: 5, y: 5 })

    state = run(state, up, WALK_MS_PER_CELL + 16)
    assert.equal(isTransitioning(state), true, 'fade began when the step finished on the door')
    assert.equal(state.mapId, 'town', 'still on the town while fading out')

    state = run(state, up, FADE_MS)
    assert.equal(state.mapId, 'house', 'swapped at black')
    assert.deepEqual(state.player.cell, { x: 3, y: 5 })
    assert.equal(state.player.facing, 'up')
    assert.ok(fadeOpacity(state.fade) > 0.5, 'still dark, fading in')
})

test('input is refused mid-fade and accepted after it', () => {
    let state = newField('town', { x: 5, y: 5 })

    state = run(state, up, WALK_MS_PER_CELL + 16)
    assert.equal(isTransitioning(state), true)

    const during = advanceField(state, right, 16, world)

    assert.equal(during.player.step, null, 'no step begins during the fade')
    assert.equal(during.player.facing, 'up', 'not even a turn')

    state = run(state, none, FADE_MS * 2 + 32)
    assert.equal(isTransitioning(state), false)

    const after = advanceField(state, right, 16, world)

    assert.notEqual(after.player.step, null, 'steps again once the fade is over')
    assert.equal(after.player.facing, 'right')
})

test('walking off a connected edge fades too and lands on the neighbour with the offset applied', () => {
    let state = newField('town', { x: 4, y: 9 }, 'down')

    state = run(state, { direction: 'down', running: false }, WALK_MS_PER_CELL + 16)
    assert.equal(isTransitioning(state), true)

    state = run(state, none, FADE_MS + 16)
    assert.equal(state.mapId, 'house')
    assert.deepEqual(state.player.cell, { x: 2, y: 0 })
    assert.equal(state.player.facing, 'down')
})

test('arriving on a warp cell does not fire it again', () => {
    const arrived = { ...newField('town', { x: 5, y: 4 }), fade: null }
    const next = advanceField(arrived, none, 16, world)

    assert.equal(isTransitioning(next), false)
})
