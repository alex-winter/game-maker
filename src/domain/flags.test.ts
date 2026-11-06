import test from 'node:test'
import assert from 'node:assert/strict'
import { addToVariable, clearFlag, hasFlag, isFlagInput, isMemory, newMemory, setFlag, variable, withVariable } from './flags'
import { addFlag, findFlag, newProject, removeFlag, withFlag, withProjectDefaults } from './project'

test('set, clear, and unknown flags', () => {
    const fresh = newMemory()

    assert.equal(hasFlag(fresh, 'got-potion'), false, 'unknown reads false')

    const got = setFlag(fresh, 'got-potion')

    assert.equal(hasFlag(got, 'got-potion'), true)
    assert.equal(setFlag(got, 'got-potion'), got, 'setting twice changes nothing')
    assert.deepEqual(got.flags, ['got-potion'])

    const cleared = clearFlag(got, 'got-potion')

    assert.equal(hasFlag(cleared, 'got-potion'), false)
    assert.equal(clearFlag(cleared, 'got-potion'), cleared)
    assert.equal(hasFlag(fresh, 'got-potion'), false, 'memory is immutable')
})

test('variables default to 0 and are separate from flags', () => {
    const memory = addToVariable(withVariable(newMemory(), 'steps', 5), 'steps', 2)

    assert.equal(variable(memory, 'steps'), 7)
    assert.equal(variable(memory, 'coins'), 0)
    assert.equal(hasFlag(memory, 'steps'), false)
})

test('isFlagInput and isMemory guard what the API and a save file carry', () => {
    assert.equal(isFlagInput({ name: 'Talked to elder' }), true)
    assert.equal(isFlagInput({ name: '  ' }), false)
    assert.equal(isMemory({ flags: ['a'], variables: { steps: 3 } }), true)
    assert.equal(isMemory({ flags: [1], variables: {} }), false)
    assert.equal(isMemory({ flags: [], variables: { steps: 'three' } }), false)
    assert.equal(isMemory(null), false)
})

test('a project stores flags by id and an older file loads with none', () => {
    let project = addFlag(newProject('Game'), { id: 'f1', name: 'Got potion' })

    assert.equal(findFlag(project, 'f1')?.name, 'Got potion')

    project = withFlag(project, { id: 'f1', name: 'Took the potion' })

    assert.equal(findFlag(project, 'f1')?.name, 'Took the potion')
    assert.equal(findFlag(removeFlag(project, 'f1'), 'f1'), undefined)

    const { flags: _flags, ...stored } = newProject('Old')

    assert.deepEqual(withProjectDefaults(stored).flags, [])
})
