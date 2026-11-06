import test from 'node:test'
import assert from 'node:assert/strict'
import { newPage } from '../domain/dialog'
import { advanceMessage, currentPage, drawMessageBox, isLastPage, moveHighlight, openMessage, wrapText } from './message'

test('a three-page message advances twice and closes on the third confirm', () => {
    let state = openMessage([newPage('one'), newPage('two'), newPage('three')])

    assert.equal(currentPage(state).text, 'one')
    assert.equal(isLastPage(state), false)

    const second = advanceMessage(state)

    assert.ok(second !== null)
    assert.equal(currentPage(second).text, 'two')

    const third = advanceMessage(second)

    assert.ok(third !== null)
    assert.equal(currentPage(third).text, 'three')
    assert.equal(isLastPage(third), true)
    assert.equal(advanceMessage(third), null)
})

test('an empty dialog still shows one page so the author sees something is wired', () => {
    assert.equal(currentPage(openMessage([])).text, '…')
})

test('wrapText breaks at spaces, keeps explicit newlines, and splits a word longer than a line', () => {
    assert.deepEqual(wrapText('Welcome to the town of Atomic House!', 12), ['Welcome to', 'the town of', 'Atomic', 'House!'])
    assert.deepEqual(wrapText('Hi\nthere', 12), ['Hi', 'there'])
    assert.deepEqual(wrapText('Supercalifragilistic', 8), ['Supercal', 'ifragili', 'stic'])
    assert.deepEqual(wrapText('', 8), [''])
})

test('drawMessageBox paints the panel at the bottom of the view and a more-mark except on the last page', () => {
    const calls: string[] = []
    const port = {
        width: 480, height: 320, clear() {},
        fillRect(x: number, y: number, w: number, h: number) { calls.push(`rect ${x},${y} ${w}x${h}`) },
        fillText(text: string, x: number, y: number) { calls.push(`text ${text} ${x},${y}`) },
        drawImage() {},
    }
    const two = openMessage([newPage('Hello there, traveller of the wide world!'), newPage('Bye')])

    drawMessageBox(port, two, { width: 240, height: 160 }, 2)

    assert.deepEqual(calls, [
        'rect 8,240 464x72',
        'rect 12,244 456x64',
        'text Hello there, traveller of the wide 20,252',
        'text world! 20,276',
        'text ▼ 448,286',
    ])

    calls.length = 0
    drawMessageBox(port, { ...two, index: 1 }, { width: 240, height: 160 }, 2)
    assert.deepEqual(calls.slice(2), ['text Bye 20,252'])
})

test('a conversation takes the second choice and lands on the linked dialog; the first choice ends it', () => {
    const ask = openMessage([newPage('Do you like the sea?', [{ label: 'Yes', nextDialogId: null }, { label: 'No', nextDialogId: 'why' }])])
    const resolve = (id: string) => (id === 'why' ? [newPage('Why ever not?'), newPage('Hmph.')] : undefined)

    assert.equal(moveHighlight(ask, -1).highlight, 0, 'stops at the top')
    assert.equal(moveHighlight(moveHighlight(ask, 1), 1).highlight, 1, 'stops at the bottom')

    const landed = advanceMessage(moveHighlight(ask, 1), resolve)

    assert.deepEqual(landed, { pages: resolve('why'), index: 0, highlight: 0 })
    assert.equal(advanceMessage(ask, resolve), null)
    assert.equal(moveHighlight(openMessage([newPage('plain')]), 1).highlight, 0, 'a page without choices has no cursor')
})

test('a choice that points at a deleted dialog says so instead of closing silently', () => {
    const ask = openMessage([newPage('Go?', [{ label: 'Yes', nextDialogId: 'gone' }])])

    assert.deepEqual(advanceMessage(ask, () => undefined)?.pages, [newPage('(No dialog "gone" exists yet.)')])
})

test('drawMessageBox draws the choice box above the message with the cursor on the highlighted row', () => {
    const calls: string[] = []
    const port = {
        width: 480, height: 320, clear() {},
        fillRect(x: number, y: number, w: number, h: number) { calls.push(`rect ${x},${y} ${w}x${h}`) },
        fillText(text: string, x: number, y: number) { calls.push(`text ${text} ${x},${y}`) },
        drawImage() {},
    }
    const ask = moveHighlight(openMessage([newPage('Go?', [{ label: 'Yes', nextDialogId: null }, { label: 'No', nextDialogId: null }])]), 1)

    drawMessageBox(port, ask, { width: 240, height: 160 }, 2)

    assert.deepEqual(calls.slice(3), [
        'rect 388,160 84x72',
        'rect 392,164 76x64',
        'text Yes 424,172',
        'text ▶ 400,196',
        'text No 424,196',
    ])
})
