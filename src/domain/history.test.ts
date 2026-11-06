import test from 'node:test'
import assert from 'node:assert/strict'
import { canRedo, canUndo, emptyHistory, record, redo, undo } from './history'

test('an empty history cannot undo or redo', () => {
    const history = emptyHistory<string>()

    assert.equal(canUndo(history), false)
    assert.equal(canRedo(history), false)
    assert.equal(undo(history, 'now'), undefined)
    assert.equal(redo(history, 'now'), undefined)
})

test('one recorded edit undoes as one step, whatever it changed, and redoes', () => {
    // A drag that painted three cells records only the state before the drag.
    let history = record(emptyHistory<string>(), 'before-stroke')
    const current = 'after-three-cells'

    const undone = undo(history, current)

    assert.ok(undone)
    assert.equal(undone.state, 'before-stroke')
    assert.equal(canUndo(undone.history), false)
    assert.equal(canRedo(undone.history), true)

    const redone = redo(undone.history, undone.state)

    assert.ok(redone)
    assert.equal(redone.state, current)
    assert.equal(canRedo(redone.history), false)
    assert.deepEqual(redone.history.past, ['before-stroke'])

    history = redone.history
})

test('a new edit after undo drops the redo branch', () => {
    const history = record(record(emptyHistory<string>(), 'a'), 'b')
    const undone = undo(history, 'c')

    assert.ok(undone)
    assert.equal(undone.state, 'b')
    assert.deepEqual(undone.history.future, ['c'])

    const branched = record(undone.history, undone.state)

    assert.deepEqual(branched.future, [])
    assert.deepEqual(branched.past, ['a', 'b'])
})

test('the stack is capped at the limit, dropping the oldest', () => {
    let history = emptyHistory<number>(3)

    for (let i = 0; i < 5; i++) {
        history = record(history, i)
    }

    assert.deepEqual(history.past, [2, 3, 4])
})
