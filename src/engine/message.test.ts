import test from 'node:test'
import assert from 'node:assert/strict'
import { advanceMessage, currentPage, drawMessageBox, isLastPage, openMessage, wrapText } from './message'

test('a three-page message advances twice and closes on the third confirm', () => {
    let state = openMessage(['one', 'two', 'three'])

    assert.equal(currentPage(state), 'one')
    assert.equal(isLastPage(state), false)

    const second = advanceMessage(state)

    assert.ok(second !== null)
    assert.equal(currentPage(second), 'two')

    const third = advanceMessage(second)

    assert.ok(third !== null)
    assert.equal(currentPage(third), 'three')
    assert.equal(isLastPage(third), true)
    assert.equal(advanceMessage(third), null)
})

test('an empty dialog still shows one page so the author sees something is wired', () => {
    assert.equal(currentPage(openMessage([])), '…')
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
    const two = openMessage(['Hello there, traveller of the wide world!', 'Bye'])

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
