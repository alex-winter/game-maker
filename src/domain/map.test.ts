import test from 'node:test'
import assert from 'node:assert/strict'
import {
    cellIndex,
    elevationAt,
    emptyTileMap,
    isBlocked,
    isSolid,
    metatileAt,
    metatileIdAt,
    withTile,
} from './map'
import { EMPTY_METATILE_ID, Metatile, metatileById, nextMetatileId, Tileset } from './tileset'

const tile = (id: number, overrides: Partial<Metatile> = {}): Metatile => ({
    id,
    sheetId: 'sheet',
    x: 0,
    y: 0,
    w: 16,
    h: 16,
    solid: false,
    elevation: 0,
    ledge: null,
    ...overrides,
})

const GRASS = 1
const WALL = 2
const CLIFF = 3
const STAIRS = 4

const tileset: Tileset = {
    id: 'ts',
    name: 'Test',
    metatiles: [
        tile(GRASS, { elevation: 3 }),
        tile(WALL, { solid: true, elevation: 3 }),
        tile(CLIFF, { elevation: 5 }),
        tile(STAIRS, { elevation: 0 }),
    ],
}

const size = { width: 3, height: 3 }

test('cellIndex is row-major and undefined outside the grid', () => {
    assert.equal(cellIndex(size, { x: 0, y: 0 }), 0)
    assert.equal(cellIndex(size, { x: 2, y: 0 }), 2)
    assert.equal(cellIndex(size, { x: 0, y: 1 }), 3)
    assert.equal(cellIndex(size, { x: 2, y: 2 }), 8)
    assert.equal(cellIndex(size, { x: 3, y: 0 }), undefined)
    assert.equal(cellIndex(size, { x: 0, y: 3 }), undefined)
    assert.equal(cellIndex(size, { x: -1, y: 0 }), undefined)
})

test('an empty map has two layers full of id 0', () => {
    const map = emptyTileMap(size)

    assert.equal(map.layers.length, 2)
    assert.equal(map.layers[0].kind, 'ground')
    assert.equal(map.layers[1].kind, 'overhead')
    assert.equal(map.layers[0].tiles.length, 9)
    assert.ok(map.layers[0].tiles.every(id => id === EMPTY_METATILE_ID))
    assert.equal(map.attributes.collision.length, 9)
})

test('withTile sets one cell without mutating and ignores the outside', () => {
    const map = emptyTileMap(size)
    const ground = withTile(map, map.layers[0], { x: 1, y: 1 }, GRASS)

    assert.equal(metatileIdAt(map, ground, { x: 1, y: 1 }), GRASS)
    assert.equal(metatileIdAt(map, map.layers[0], { x: 1, y: 1 }), EMPTY_METATILE_ID)
    assert.equal(withTile(map, ground, { x: 9, y: 9 }, GRASS), ground)
})

test('metatileAt answers the tileset entry, or undefined for empty and outside', () => {
    const map = emptyTileMap(size)
    const ground = withTile(map, map.layers[0], { x: 0, y: 2 }, WALL)

    assert.equal(metatileAt(map, ground, tileset, { x: 0, y: 2 })?.id, WALL)
    assert.equal(metatileAt(map, ground, tileset, { x: 1, y: 2 }), undefined)
    assert.equal(metatileAt(map, ground, tileset, { x: 5, y: 2 }), undefined)
    assert.equal(metatileById(tileset, EMPTY_METATILE_ID), undefined)
})

test('a 3×3 map with one solid metatile blocks only there', () => {
    const map = emptyTileMap(size)

    map.layers[0] = withTile(map, map.layers[0], { x: 1, y: 1 }, WALL)

    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            assert.equal(isBlocked(map, tileset, { x, y }), x === 1 && y === 1, `cell ${x},${y}`)
        }
    }
})

test('a cell outside the map is blocked', () => {
    const map = emptyTileMap(size)

    assert.equal(isBlocked(map, tileset, { x: -1, y: 0 }), true)
    assert.equal(isBlocked(map, tileset, { x: 0, y: 3 }), true)
})

test('painted collision blocks even on an empty cell', () => {
    const map = emptyTileMap(size)

    map.attributes.collision[4] = 1

    assert.equal(isSolid(map, tileset, { x: 1, y: 1 }), true)
    assert.equal(isSolid(map, tileset, { x: 0, y: 0 }), false)
})

test('a solid metatile on the overhead layer blocks too', () => {
    const map = emptyTileMap(size)

    map.layers[1] = withTile(map, map.layers[1], { x: 2, y: 2 }, WALL)

    assert.equal(isBlocked(map, tileset, { x: 2, y: 2 }), true)
})

test('elevation comes from the painted attribute, else the front-most metatile', () => {
    const map = emptyTileMap(size)

    map.layers[0] = withTile(map, map.layers[0], { x: 0, y: 0 }, GRASS)
    map.layers[1] = withTile(map, map.layers[1], { x: 0, y: 0 }, CLIFF)
    map.attributes.elevation[1] = 7

    assert.equal(elevationAt(map, tileset, { x: 0, y: 0 }), 5)
    assert.equal(elevationAt(map, tileset, { x: 1, y: 0 }), 7)
    assert.equal(elevationAt(map, tileset, { x: 2, y: 0 }), 0)
    assert.equal(elevationAt(map, tileset, { x: 9, y: 0 }), 0)
})

test('stepping between different non-zero elevations is blocked, through 0 is not', () => {
    const map = emptyTileMap(size)
    let ground = map.layers[0]

    ground = withTile(map, ground, { x: 0, y: 0 }, GRASS)
    ground = withTile(map, ground, { x: 1, y: 0 }, CLIFF)
    ground = withTile(map, ground, { x: 2, y: 0 }, STAIRS)
    ground = withTile(map, ground, { x: 0, y: 1 }, GRASS)
    map.layers[0] = ground

    assert.equal(isBlocked(map, tileset, { x: 1, y: 0 }, { x: 0, y: 0 }), true)
    assert.equal(isBlocked(map, tileset, { x: 0, y: 1 }, { x: 0, y: 0 }), false)
    assert.equal(isBlocked(map, tileset, { x: 2, y: 0 }, { x: 1, y: 0 }), false)
    assert.equal(isBlocked(map, tileset, { x: 1, y: 0 }, { x: 2, y: 0 }), false)
})

test('the next metatile id skips 0 and follows the largest in use', () => {
    assert.equal(nextMetatileId({ id: 't', name: 't', metatiles: [] }), 1)
    assert.equal(nextMetatileId(tileset), 5)
})
