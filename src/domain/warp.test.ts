import test from 'node:test'
import assert from 'node:assert/strict'
import { advanceStep, beginStep, newPlayer, stepPlayer } from './movement'
import { isMapEvents, newNpcEvent, newWarp, npcsOn, warpAt, warpTaken, withEvent, withoutEvent } from './warp'

const door = newWarp('door', { x: 4, y: 2 }, 'house', { x: 3, y: 5 }, 'up')
const exit = newWarp('exit', { x: 3, y: 6 }, 'town', { x: 4, y: 3 }, 'down')

test('stepping onto a door cell yields the destination map, cell, and facing', () => {
    let player = beginStep(newPlayer({ x: 4, y: 3 }, 'up'), 'up', 100, () => true)
    const before = advanceStep(player, 50)

    player = advanceStep(before, 50)

    const taken = warpTaken(before, player, [door])

    assert.deepEqual(taken && { toMapId: taken.toMapId, toCell: taken.toCell, facing: taken.facing }, { toMapId: 'house', toCell: { x: 3, y: 5 }, facing: 'up' })
})

test('spawning or arriving on a warp does not fire it; only a finished step does', () => {
    const standing = newPlayer({ x: 3, y: 6 }, 'down')

    assert.equal(warpTaken(standing, standing, [exit]), undefined, 'arrived and standing')

    const stepping = beginStep(standing, 'down', 100, () => true)

    assert.equal(warpTaken(standing, stepping, [exit]), undefined, 'mid-step on the warp cell')
    assert.equal(warpTaken(stepping, advanceStep(stepping, 100), [exit]), undefined, 'stepped off it')
})

test('a held key that chains straight into the next step still fires the warp it finished on', () => {
    const before = beginStep(newPlayer({ x: 4, y: 3 }, 'up'), 'up', 100, () => true)
    const after = stepPlayer(before, { direction: 'up', running: false }, 100, () => true)

    assert.notEqual(after.step, null, 'the next step already began')
    assert.equal(warpTaken(before, after, [door])?.id, 'door')
})

test('warpAt finds the warp on a cell; one warp per cell; events are replaced by id', () => {
    const events = withEvent(withEvent([], door), exit)

    assert.equal(warpAt(events, { x: 4, y: 2 })?.id, 'door')
    assert.equal(warpAt(events, { x: 0, y: 0 }), undefined)

    const moved = withEvent(events, { ...door, cell: { x: 3, y: 6 } })

    assert.deepEqual(moved.map(e => e.id), ['door'], 'the exit on that cell is dropped')
    assert.deepEqual(withEvent(events, { ...door, facing: 'left' }).map(e => [e.id, e.kind === 'warp' ? e.facing : '']), [['exit', 'down'], ['door', 'left']])
    assert.deepEqual(withoutEvent(events, 'door').map(e => e.id), ['exit'])
})

test('the event list is checked on the way in', () => {
    assert.equal(isMapEvents([door, exit]), true)
    assert.equal(isMapEvents([{ ...door, facing: 'north' }]), false)
    assert.equal(isMapEvents([{ ...door, toCell: { x: 1.5, y: 0 } }]), false)
    assert.equal(isMapEvents([{ kind: 'npc', id: 'n' }]), false)
    assert.equal(isMapEvents([{ kind: 'sign', id: 's', cell: { x: 1, y: 1 }, dialogId: 'd' }]), true)
    assert.equal(isMapEvents([{ kind: 'sign', id: 's', cell: { x: 1, y: 1 } }]), false)
    assert.equal(isMapEvents([newNpcEvent('mom', { x: 2, y: 2 }, 'Mom', null, 'down', null)]), true)
    assert.equal(isMapEvents([{ ...newNpcEvent('mom', { x: 2, y: 2 }, 'Mom', 'sprite-1', 'left', 'hello'), facing: 'away' }]), false)
})

test('a map reports the people standing on it, by cell', () => {
    const mom = newNpcEvent('mom', { x: 2, y: 2 }, 'Mom', 'sprite-1', 'down', 'mom-hello')
    const events = withEvent(withEvent([door], mom), { ...mom, cell: { x: 3, y: 2 } })

    assert.deepEqual(npcsOn(events).map(npc => npc.cell), [{ x: 3, y: 2 }], 'moving an NPC replaces them, it does not clone them')
    assert.equal(npcsOn(withoutEvent(events, 'mom')).length, 0)
})
