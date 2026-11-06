import test from 'node:test'
import assert from 'node:assert/strict'
import { drawMenu, MENU_ENTRIES, moveMenu, openMenu, selectedEntry } from './menu'

test('the cursor moves through the entries and wraps at both ends', () => {
    let menu = openMenu()

    assert.equal(selectedEntry(menu), 'bag')

    menu = moveMenu(menu, -1)
    assert.equal(selectedEntry(menu), 'close', 'up from the top wraps to the bottom')

    menu = moveMenu(menu, 1)
    assert.equal(selectedEntry(menu), 'bag', 'down from the bottom wraps to the top')

    menu = moveMenu(moveMenu(menu, 1), 1)
    assert.equal(selectedEntry(menu), 'save')
})

test('drawMenu lists every entry in the top-right corner, greys disabled ones, and marks the highlight', () => {
    const calls: string[] = []
    const port = {
        width: 480, height: 320, clear() {},
        fillRect(x: number, y: number, w: number, h: number) { calls.push(`rect ${x},${y} ${w}x${h}`) },
        fillText(text: string, x: number, y: number, _size: number, color: string) { calls.push(`text ${text} ${x},${y} ${color}`) },
        drawImage() {},
    }

    drawMenu(port, moveMenu(openMenu(), 2), { width: 240, height: 160 }, 2, new Set(['close']))

    assert.deepEqual(calls, [
        'rect 364,8 108x120',
        'rect 368,12 100x112',
        'text BAG 400,20 #a0a0a8',
        'text PARTY 400,44 #a0a0a8',
        'text ▶ 376,68 #c04040',
        'text SAVE 400,68 #a0a0a8',
        'text CLOSE 400,92 #30304a',
    ])
    assert.equal(MENU_ENTRIES.length, 4)
})
