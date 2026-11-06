import test from 'node:test'
import assert from 'node:assert/strict'
import { isDialogInput, newDialog } from './dialog'
import { addDialog, findDialog, newProject, removeDialog, withDialog, withProjectDefaults } from './project'

test('isDialogInput wants a name and at least one page of strings', () => {
    assert.equal(isDialogInput({ name: 'Sign', pages: ['Hi'] }), true)
    assert.equal(isDialogInput({ name: 'Sign', pages: [''] }), true, 'an empty page is allowed while the author is still typing')
    assert.equal(isDialogInput({ name: ' ', pages: ['Hi'] }), false)
    assert.equal(isDialogInput({ name: 'Sign', pages: [] }), false)
    assert.equal(isDialogInput({ name: 'Sign', pages: [1] }), false)
    assert.equal(isDialogInput(null), false)
})

test('a project stores dialogs, replaces them by id, and reads back the pages a sign needs', () => {
    const welcome = newDialog('welcome', 'Town sign', ['Welcome!'])
    let project = addDialog(newProject('Game'), welcome)

    assert.deepEqual(findDialog(project, 'welcome')?.pages, ['Welcome!'])

    project = withDialog(project, { ...welcome, pages: ['Welcome!', 'Enjoy.'] })

    assert.deepEqual(findDialog(project, 'welcome')?.pages, ['Welcome!', 'Enjoy.'])
    assert.equal(project.dialogs.length, 1)
    assert.equal(findDialog(removeDialog(project, 'welcome'), 'welcome'), undefined)
})

test('an older project file without dialogs loads with an empty list', () => {
    const { dialogs: _dialogs, ...stored } = newProject('Old')

    assert.deepEqual(withProjectDefaults(stored).dialogs, [])
})
