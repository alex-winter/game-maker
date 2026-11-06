import test from 'node:test'
import assert from 'node:assert/strict'
import { isDialogInput, newDialog, newPage, withDialogDefaults } from './dialog'
import { addDialog, findDialog, newProject, removeDialog, withDialog, withProjectDefaults } from './project'

test('isDialogInput wants a name and at least one page, each with text and at most four well-formed choices', () => {
    assert.equal(isDialogInput({ name: 'Sign', pages: [newPage('Hi')] }), true)
    assert.equal(isDialogInput({ name: 'Sign', pages: [newPage('')] }), true, 'an empty page is allowed while the author is still typing')
    assert.equal(isDialogInput({ name: 'Sign', pages: [newPage('Go?', [{ label: 'Yes', nextDialogId: 'go' }, { label: 'No', nextDialogId: null }])] }), true)
    assert.equal(isDialogInput({ name: ' ', pages: [newPage('Hi')] }), false)
    assert.equal(isDialogInput({ name: 'Sign', pages: [] }), false)
    assert.equal(isDialogInput({ name: 'Sign', pages: ['Hi'] }), false, 'bare strings are the old shape; the store migrates them, the API does not accept them')
    assert.equal(isDialogInput({ name: 'Sign', pages: [{ text: 'Hi' }] }), false)
    assert.equal(isDialogInput({ name: 'Sign', pages: [{ text: 'Hi', choices: [{ label: 'a', nextDialogId: 1 }] }] }), false)
    assert.equal(isDialogInput({ name: 'Sign', pages: [newPage('Hi', Array(5).fill({ label: 'x', nextDialogId: null }))] }), false)
    assert.equal(isDialogInput(null), false)
})

test('a dialog stored with bare string pages reads back as pages without choices', () => {
    assert.deepEqual(withDialogDefaults({ id: 'd', name: 'Old', pages: ['One', 'Two'] }).pages, [newPage('One'), newPage('Two')])
})

test('a project stores dialogs, replaces them by id, and reads back the pages a sign needs', () => {
    const welcome = newDialog('welcome', 'Town sign', [newPage('Welcome!')])
    let project = addDialog(newProject('Game'), welcome)

    assert.deepEqual(findDialog(project, 'welcome')?.pages, [newPage('Welcome!')])

    project = withDialog(project, { ...welcome, pages: [newPage('Welcome!'), newPage('Enjoy.')] })

    assert.deepEqual(findDialog(project, 'welcome')?.pages, [newPage('Welcome!'), newPage('Enjoy.')])
    assert.equal(project.dialogs.length, 1)
    assert.equal(findDialog(removeDialog(project, 'welcome'), 'welcome'), undefined)
})

test('an older project file without dialogs loads with an empty list', () => {
    const { dialogs: _dialogs, ...stored } = newProject('Old')

    assert.deepEqual(withProjectDefaults(stored).dialogs, [])
})
