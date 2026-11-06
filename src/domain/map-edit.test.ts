import test from 'node:test'
import assert from 'node:assert/strict'
import {
    addTileLayer,
    attributesAt,
    emptyTileMap,
    floodFill,
    floodFillCells,
    isBlocked,
    isTileMap,
    isValidGridSize,
    metatileIdAt,
    moveTileLayer,
    removeTileLayer,
    renameTileLayer,
    resizeGrid,
    resizeTileMap,
    TileLayer,
    withCell,
    withCellsRect,
    withCollision,
    withElevation,
    withRect,
    withTile,
    withTileLayer,
    withTileMapDefaults,
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
    assert.equal(isTileMap({ ...map, attributes: { collision: [], elevation: [], ledge: [] } }), false)
    assert.equal(isTileMap(null), false)
})

test('attribute painting: collision and elevation are separate from the picture', () => {
    const map = emptyTileMap(size)
    const walled = withCollision(map, withCellsRect(map, map.attributes.collision, { x: 1, y: 0 }, { x: 1, y: 2 }, 1))

    assert.deepEqual(walled.attributes.collision, [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0])
    assert.equal(walled.layers[0].tiles.every(id => id === 0), true, 'no picture changed')
    assert.deepEqual(attributesAt(walled, { x: 1, y: 1 }), { solid: true, elevation: 0, ledge: null, grass: false })
    assert.deepEqual(attributesAt(walled, { x: 0, y: 1 }), { solid: false, elevation: 0, ledge: null, grass: false })

    const raised = withElevation(walled, withCell(walled, walled.attributes.elevation, { x: 3, y: 2 }, 4))

    assert.equal(attributesAt(raised, { x: 3, y: 2 }).elevation, 4)

    const flooded = withCollision(map, floodFillCells(map, walled.attributes.collision, { x: 0, y: 0 }, 1, 0))

    assert.deepEqual(flooded.attributes.collision, [1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0], 'the wall stops the fill')
})

test('a wall of solid cells blocks those cells only', () => {
    const tileset = { id: 'ts', name: 'T', metatiles: [] }
    const map = withCollision(emptyTileMap(size), withCellsRect(emptyTileMap(size), emptyTileMap(size).attributes.collision, { x: 2, y: 0 }, { x: 2, y: 2 }, 1))

    for (let y = 0; y < size.height; y++) {
        for (let x = 0; x < size.width; x++) {
            assert.equal(isBlocked(map, tileset, { x, y }), x === 2, `cell ${x},${y}`)
        }
    }
})

test('withTileMapDefaults adds the ledge array an older file lacks', () => {
    const map = emptyTileMap(size)
    const old = { ...map, attributes: { collision: map.attributes.collision, elevation: map.attributes.elevation } } as unknown as Parameters<typeof withTileMapDefaults>[0]
    const fixed = withTileMapDefaults(old)

    assert.equal(fixed.attributes.ledge.length, 12)
    assert.equal(isTileMap(old), false)
    assert.equal(isTileMap(fixed), true)
    assert.equal(withTileMapDefaults(fixed), fixed)
})

test('resizeGrid: 10×10 → 12×8 keeps the top-left 10×8 and pads the rest with empty', () => {
    const from = { width: 10, height: 10 }
    const cells = Array.from({ length: 100 }, (_, i) => i + 1)
    const resized = resizeGrid(from, cells, { width: 12, height: 8 }, 0)

    assert.equal(resized.length, 96)

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 12; x++) {
            const expected = x < 10 ? y * 10 + x + 1 : 0

            assert.equal(resized[y * 12 + x], expected, `cell ${x},${y}`)
        }
    }
})

test('resizeTileMap resizes every layer and attribute grid together', () => {
    const map = emptyTileMap({ width: 3, height: 2 })

    map.layers[0] = withTile(map, map.layers[0], { x: 2, y: 1 }, 7)
    map.attributes.collision[0] = 1

    const bigger = resizeTileMap(map, { width: 4, height: 3 })

    assert.equal(bigger.width, 4)
    assert.equal(bigger.layers[0].tiles.length, 12)
    assert.equal(bigger.layers[0].tiles[1 * 4 + 2], 7)
    assert.equal(bigger.attributes.collision[0], 1)
    assert.equal(bigger.attributes.ledge.length, 12)
    assert.equal(isTileMap(bigger), true)

    const smaller = resizeTileMap(bigger, { width: 2, height: 1 })

    assert.deepEqual(smaller.layers[0].tiles, [0, 0])
    assert.equal(resizeTileMap(smaller, { width: 2, height: 1 }), smaller, 'same size is a no-op')
})

test('isValidGridSize accepts 1..256 integers only', () => {
    assert.equal(isValidGridSize({ width: 20, height: 20 }), true)
    assert.equal(isValidGridSize({ width: 0, height: 20 }), false)
    assert.equal(isValidGridSize({ width: 2.5, height: 20 }), false)
    assert.equal(isValidGridSize({ width: 257, height: 20 }), false)
    assert.equal(isValidGridSize('20x20'), false)
})
