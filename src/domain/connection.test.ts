import test from 'node:test'
import assert from 'node:assert/strict'
import { crossEdge, edgeOf, isConnections } from './connection'

const town = { width: 10, height: 8 }
const route = { width: 20, height: 30 }
const sizeOf = (id: string) => (id === 'route' ? route : undefined)

test('edgeOf names the edge beyond a cell and ignores corners and the inside', () => {
    assert.equal(edgeOf(town, { x: 3, y: -1 }), 'north')
    assert.equal(edgeOf(town, { x: 3, y: 8 }), 'south')
    assert.equal(edgeOf(town, { x: 10, y: 2 }), 'east')
    assert.equal(edgeOf(town, { x: -1, y: 2 }), 'west')
    assert.equal(edgeOf(town, { x: -1, y: -1 }), undefined)
    assert.equal(edgeOf(town, { x: 3, y: 3 }), undefined)
})

test('a north connection with offset 3 lines this map\'s x=0 up with the other map\'s x=3, on its last row', () => {
    const crossing = crossEdge(town, { north: { mapId: 'route', offset: 3 } }, { x: 0, y: -1 }, sizeOf)

    assert.deepEqual(crossing, { mapId: 'route', cell: { x: 3, y: 29 } })
})

test('south lands on row 0, east on column 0, west on the last column, each with the offset applied', () => {
    assert.deepEqual(crossEdge(town, { south: { mapId: 'route', offset: 5 } }, { x: 2, y: 8 }, sizeOf), { mapId: 'route', cell: { x: 7, y: 0 } })
    assert.deepEqual(crossEdge(town, { east: { mapId: 'route', offset: -1 } }, { x: 10, y: 4 }, sizeOf), { mapId: 'route', cell: { x: 0, y: 3 } })
    assert.deepEqual(crossEdge(town, { west: { mapId: 'route', offset: 0 } }, { x: -1, y: 4 }, sizeOf), { mapId: 'route', cell: { x: 19, y: 4 } })
})

test('no connection, a missing destination, or a landing cell off the destination all refuse the step', () => {
    assert.equal(crossEdge(town, {}, { x: 0, y: -1 }, sizeOf), undefined)
    assert.equal(crossEdge(town, { north: { mapId: 'gone', offset: 0 } }, { x: 0, y: -1 }, sizeOf), undefined)
    assert.equal(crossEdge(town, { north: { mapId: 'route', offset: 25 } }, { x: 0, y: -1 }, sizeOf), undefined)
    assert.equal(crossEdge(town, { north: { mapId: 'route', offset: -1 } }, { x: 0, y: -1 }, sizeOf), undefined)
})

test('the connections payload is checked edge by edge', () => {
    assert.equal(isConnections({}), true)
    assert.equal(isConnections({ north: { mapId: 'route', offset: 2 }, west: { mapId: 'route', offset: -3 } }), true)
    assert.equal(isConnections({ up: { mapId: 'route', offset: 2 } }), false)
    assert.equal(isConnections({ north: { mapId: 'route', offset: 1.5 } }), false)
    assert.equal(isConnections({ north: null }), false)
})
