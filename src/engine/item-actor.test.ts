import test from 'node:test'
import assert from 'node:assert/strict'
import { Tileset } from '../domain/tileset'
import { newItemEvent } from '../domain/warp'
import { ITEM_COLOR, itemActor } from './item-actor'

const tileset: Tileset = {
    id: 'ts',
    name: 'Town',
    metatiles: [{ id: 7, sheetId: 'sheet', x: 32, y: 16, w: 16, h: 16, solid: false, elevation: 0, ledge: null }],
}

test('an item draws its metatile on its cell, or a green cell when it has none', () => {
    const ball = newItemEvent('ball', { x: 2, y: 3 }, 'potion', 'took', 7)
    const sheets = new Map([['sheet', 'img']])

    assert.deepEqual(itemActor(ball, tileset, sheets), {
        x: 32, y: 48, width: 16, height: 16, color: ITEM_COLOR,
        sprite: { image: 'img', sx: 32, sy: 16, sw: 16, sh: 16 },
    })
    assert.deepEqual(itemActor({ ...ball, metatileId: null }, tileset, sheets), { x: 32, y: 48, width: 16, height: 16, color: ITEM_COLOR })
    assert.equal(itemActor(ball, undefined, sheets).sprite, undefined)
})
