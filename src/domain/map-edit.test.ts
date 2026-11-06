import test from 'node:test'
import assert from 'node:assert/strict'
import {
    addTileLayer,
    emptyTileMap,
    floodFill,
    isTileMap,
    metatileIdAt,
    moveTileLayer,
    removeTileLayer,
    renameTileLayer,
    TileLayer,
    withRect,
    withTile,
    withTileLayer,
} from './map'

const size = { width: 4, height: 3 }

function layerFrom(rows: string): TileLayer {
    return {
        id: 'L',
        name: 'L',
        kind: 'ground',
        tiles: rows.replace(/\s+/g, '').split('').map(Number),
    }
}

function rowsOf(layer: TileLayer): string {
    const rows: string[] = []

    for (let y = 0; y < size.height; y++) {
        rows.push(layer.tiles.slice(y * size.width, (y + 1) * size.width).join(''))
    }

    return rows.join(' ')
}

test('flood fill replaces the connected region only', () => {
    const layer = layerFrom(`
        1100
        1010
        0011
    `)

    const filled = floodFill(size, layer, { x: 0, y: 0 }, 7)

    assert.equal(rowsOf(filled), '7700 7010 0011')
    assert.equal(rowsOf(layer), '1100 1010 0011', 'the input is not mutated')
})

test('flood fill of the empty region stops at painted cells and the map edge', () => {
    const layer = layerFrom(`
        0100
        0100
        0100
    `)

    assert.equal(rowsOf(floodFill(size, layer, { x: 3, y: 1 }, 2)), '0122 0122 0122')
})

test('flood fill with the id already there, or from outside, is a no-op', () => {
    const layer = layerFrom('1111 1111 1111')

    assert.equal(floodFill(size, layer, { x: 0, y: 0 }, 1), layer)
    assert.equal(floodFill(size, layer, { x: 9, y: 0 }, 2), layer)
})

test('withRect fills the inclusive rectangle between two corners, clamped to the map', () => {
    const layer = layerFrom('0000 0000 0000')

    assert.equal(rowsOf(withRect(size, layer, { x: 2, y: 2 }, { x: 1, y: 0 }, 5)), '0550 0550 0550')
    assert.equal(rowsOf(withRect(size, layer, { x: 3, y: 1 }, { x: 10, y: 10 }, 5)), '0000 0005 0005')
})

test('withTile outside the grid leaves the layer unchanged', () => {
    const layer = layerFrom('0000 0000 0000')

    assert.equal(withTile(size, layer, { x: -1, y: 0 }, 1), layer)
    assert.equal(metatileIdAt(size, withTile(size, layer, { x: 1, y: 1 }, 9), { x: 1, y: 1 }), 9)
})

test('layer list edits: add, rename, move, remove, replace', () => {
    const map = emptyTileMap(size)
    const added = addTileLayer(map, 'Detail', 'ground')

    assert.equal(added.layers.length, 3)
    assert.equal(added.layers[2].name, 'Detail')
    assert.equal(added.layers[2].tiles.length, 12)

    const detail = added.layers[2]
    const renamed = renameTileLayer(added, detail.id, 'Props')

    assert.equal(renamed.layers[2].name, 'Props')

    const movedBack = moveTileLayer(renamed, detail.id, -1)

    assert.deepEqual(movedBack.layers.map(layer => layer.name), ['Ground', 'Props', 'Overhead'])
    assert.equal(moveTileLayer(movedBack, movedBack.layers[0].id, -1), movedBack, 'cannot move past the back')

    const painted = withTileLayer(movedBack, withTile(size, movedBack.layers[1], { x: 0, y: 0 }, 4))

    assert.equal(painted.layers[1].tiles[0], 4)

    const removed = removeTileLayer(painted, detail.id)

    assert.deepEqual(removed.layers.map(layer => layer.name), ['Ground', 'Overhead'])

    const one = removeTileLayer(removed, removed.layers[0].id)

    assert.equal(removeTileLayer(one, one.layers[0].id), one, 'the last layer stays')
})

test('isTileMap accepts a fresh map and rejects a broken one', () => {
    const map = emptyTileMap(size)

    assert.equal(isTileMap(map), true)
    assert.equal(isTileMap(JSON.parse(JSON.stringify(map))), true)
    assert.equal(isTileMap({ ...map, layers: [] }), false)
    assert.equal(isTileMap({ ...map, width: 0 }), false)
    assert.equal(isTileMap({ ...map, layers: [{ ...map.layers[0], tiles: [1, 2] }] }), false)
    assert.equal(isTileMap({ ...map, layers: [{ ...map.layers[0], tiles: map.layers[0].tiles.map(() => -1) }] }), false)
    assert.equal(isTileMap({ ...map, attributes: { collision: [], elevation: [] } }), false)
    assert.equal(isTileMap(null), false)
})
