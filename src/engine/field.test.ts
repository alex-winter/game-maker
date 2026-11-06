import test from 'node:test'
import assert from 'node:assert/strict'
import { insideMap, WALK_MS_PER_CELL } from '../domain/movement'
import { newPage } from '../domain/dialog'
import { newSign, newWarp } from '../domain/warp'
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
    eventsOf: id => (id === 'town' ? [door, newSign('sign', { x: 6, y: 5 }, 'welcome')] : []),
    pagesOf: id => (id === 'welcome' ? [newPage('Welcome!'), newPage('Enjoy your stay.')]
        : id === 'ask' ? [newPage('Take the boat?', [{ label: 'Yes', nextDialogId: 'boat' }, { label: 'No', nextDialogId: null }])]
        : id === 'boat' ? [newPage('Off you go.')]
        : undefined),
}

const right = { direction: 'right' as const, running: false, interact: false }
const up = { direction: 'up' as const, running: false, interact: false }
const none = { direction: null, running: false, interact: false }

function run(state: FieldState, input: { direction: 'up' | 'down' | 'left' | 'right' | null; running: boolean; interact: boolean }, ms: number, step = 16): FieldState {
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

    state = run(state, { direction: 'down', running: false, interact: false }, WALK_MS_PER_CELL + 16)
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

test('the interact key reports the sign in front and does not move the player, even with a direction held', () => {
    const facing = newField('town', { x: 5, y: 5 }, 'right')
    const pressed = advanceField(facing, { ...right, interact: true }, 16, world)

    assert.deepEqual(pressed.interaction, { kind: 'sign', eventId: 'sign', dialogId: 'welcome' })
    assert.equal(pressed.player.step, null)
    assert.deepEqual(pressed.player.cell, { x: 5, y: 5 })

    const next = advanceField(pressed, none, 16, world)

    assert.equal(next.interaction, undefined, 'cleared the next frame')

    const nothing = advanceField(newField('town', { x: 5, y: 5 }, 'left'), { ...none, interact: true }, 16, world)

    assert.equal(nothing.interaction, undefined)
})

test('a sign opens its dialog; movement does nothing while it is open; the interact key pages and closes it', () => {
    const facing = newField('town', { x: 5, y: 5 }, 'right')
    const opened = advanceField(facing, { ...none, interact: true }, 16, world)

    assert.deepEqual(opened.message, { pages: [newPage('Welcome!'), newPage('Enjoy your stay.')], index: 0, highlight: 0 })

    const walking = advanceField(opened, { direction: 'down', running: true, interact: false }, 500, world)

    assert.deepEqual(walking.player.cell, { x: 5, y: 5 })
    assert.equal(walking.player.step, null)
    assert.equal(walking.player.facing, 'right')
    assert.equal(walking.message?.index, 0)

    const paged = advanceField(walking, { ...none, interact: true }, 16, world)

    assert.equal(paged.message?.index, 1)

    const closed = advanceField(paged, { ...none, interact: true }, 16, world)

    assert.equal(closed.message, null)
    assert.equal(closed.interaction, undefined, 'closing the box is not a new look')

    const stepping = advanceField(closed, right, 16, world)

    assert.notEqual(stepping.player.step, null, 'walking resumes once the box is closed')
})

test('a sign whose dialog does not exist says so instead of opening nothing', () => {
    const lost: FieldWorld = { ...world, pagesOf: () => undefined }
    const opened = advanceField(newField('town', { x: 5, y: 5 }, 'right'), { ...none, interact: true }, 16, lost)

    assert.deepEqual(opened.message?.pages, [newPage('(No dialog "welcome" exists yet.)')])
})

test('a held direction moves the choice cursor once; a fresh press moves it again; confirm takes the highlighted branch', () => {
    const asking: FieldWorld = { ...world, eventsOf: () => [newSign('sign', { x: 6, y: 5 }, 'ask')] }
    const opened = advanceField(newField('town', { x: 5, y: 5 }, 'right'), { ...none, interact: true }, 16, asking)

    assert.equal(opened.message?.highlight, 0)

    const down = { direction: 'down' as const, running: false, interact: false }
    const held1 = advanceField(opened, down, 16, asking)
    const held2 = advanceField(held1, down, 16, asking)

    assert.equal(held1.message?.highlight, 1)
    assert.equal(held2.message?.highlight, 1, 'holding does not keep moving')
    assert.deepEqual(held2.player.cell, { x: 5, y: 5 }, 'and never walks')

    const released = advanceField(held2, none, 16, asking)
    const up = advanceField(released, { ...down, direction: 'up' }, 16, asking)

    assert.equal(up.message?.highlight, 0)

    const second = advanceField(advanceField(up, none, 16, asking), down, 16, asking)
    const confirmed = advanceField(second, { ...none, interact: true }, 16, asking)

    assert.equal(confirmed.message, null, '"No" ends the conversation')

    const yes = advanceField(opened, { ...none, interact: true }, 16, asking)

    assert.deepEqual(yes.message?.pages, [newPage('Off you go.')], '"Yes" opens the linked dialog')
})
