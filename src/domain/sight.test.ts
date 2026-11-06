import test from 'node:test'
import assert from 'node:assert/strict'
import { lineOfSight, sees } from './sight'

const open = () => false
const trainer = { x: 2, y: 2 }

test('a trainer sees along the way they face, as far as their range, and no further', () => {
    assert.deepEqual(lineOfSight(trainer, 'right', 3, open), [{ x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }])
    assert.equal(sees(trainer, 'right', 3, { x: 4, y: 2 }, open), true, 'in range on the line')
    assert.equal(sees(trainer, 'right', 3, { x: 6, y: 2 }, open), false, 'one past the range')
    assert.equal(sees(trainer, 'right', 3, { x: 4, y: 3 }, open), false, 'off the line')
    assert.equal(sees(trainer, 'right', 3, { x: 1, y: 2 }, open), false, 'behind')
    assert.equal(sees(trainer, 'down', 2, { x: 2, y: 4 }, open), true)
})

test('a wall cuts the line short: the cells beyond it are out of sight', () => {
    const wall = (_from: { x: number; y: number }, to: { x: number; y: number }) => to.x === 4 && to.y === 2

    assert.deepEqual(lineOfSight(trainer, 'right', 5, wall), [{ x: 3, y: 2 }])
    assert.equal(sees(trainer, 'right', 5, { x: 5, y: 2 }, wall), false)
    assert.equal(sees(trainer, 'right', 5, { x: 3, y: 2 }, wall), true)
})
