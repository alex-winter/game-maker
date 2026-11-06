import test from 'node:test'
import assert from 'node:assert/strict'
import { addToBag, newBag } from '../domain/item'
import { drawBagScreen, firstVisibleRow, moveBagCursor, openBagScreen } from './bag-screen'

test('the cursor stops at both ends and sits at 0 for an empty bag', () => {
    assert.equal(moveBagCursor(openBagScreen(), -1, 3).highlight, 0)
    assert.equal(moveBagCursor(moveBagCursor(openBagScreen(), 1, 3), 5, 3).highlight, 2)
    assert.equal(moveBagCursor({ highlight: 4 }, 1, 0).highlight, 0)
})

test('the list scrolls so the highlighted row stays on screen', () => {
    assert.equal(firstVisibleRow(0, 20, 7), 0)
    assert.equal(firstVisibleRow(6, 20, 7), 0)
    assert.equal(firstVisibleRow(7, 20, 7), 1)
    assert.equal(firstVisibleRow(19, 20, 7), 13)
    assert.equal(firstVisibleRow(2, 3, 7), 0, 'a short list never scrolls')
})

test('drawBagScreen lists stacks with quantities, marks the cursor, and describes the highlighted item', () => {
    const calls: string[] = []
    const port = {
        width: 480, height: 320, clear() {},
        fillRect() {},
        fillText(text: string, x: number, y: number) { calls.push(`${text} @${x},${y}`) },
        drawImage() {},
    }
    const bag = addToBag(addToBag(addToBag(newBag(), 'potion'), 'rope'), 'potion')
    const lookup = (id: string) => (id === 'potion' ? { name: 'Potion', description: 'Heals 20 HP.' } : id === 'rope' ? { name: 'Rope', description: 'Climb.' } : undefined)

    drawBagScreen(port, bag, lookup, moveBagCursor(openBagScreen(), 1, bag.length), { width: 240, height: 160 }, 2)

    assert.deepEqual(calls, [
        'BAG @20,20',
        'POTION @44,44',
        '×2 @412,44',
        '▶ @20,68',
        'ROPE @44,68',
        '×1 @412,68',
        'Climb. @20,252',
    ])

    calls.length = 0
    drawBagScreen(port, newBag(), lookup, openBagScreen(), { width: 240, height: 160 }, 2)
    assert.deepEqual(calls, ['BAG @20,20', 'Nothing in the bag. @44,44', ' @20,252'])
})
