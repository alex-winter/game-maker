import test from 'node:test'
import assert from 'node:assert/strict'
import type { Layer } from 'Model/Layer'
import {
    addMap,
    defaultProject,
    findMap,
    isValidMapName,
    newMap,
    projectFromLegacyLayers,
    renameMap,
    withMapLayers,
    withProjectDefaults,
    withMapTileMap,
    removeMap,
    startMap,
    withStartMap,
    DEFAULT_MAP_SIZE,
} from './project'

const layer = (uuid: string): Layer => ({
    uuid,
    type: 'image',
    name: uuid,
    created_at: '2026-01-01T00:00:00.000Z',
    is_visible: true,
    is_active: false,
    order: 0,
    placements: [{ uuid: 'p-' + uuid, coordinate: { x: 16, y: 32 }, imageUuid: 'img' }],
})

test('a legacy layer list becomes one map that keeps its placements', () => {
    const project = projectFromLegacyLayers([layer('a'), layer('b')])

    assert.equal(project.maps.length, 1)
    assert.deepEqual(project.maps[0].layers.map(l => l.uuid), ['a', 'b'])
    assert.deepEqual(project.maps[0].layers[0].placements[0].coordinate, { x: 16, y: 32 })
})

test('the default project has one empty map with a tile grid', () => {
    const project = defaultProject()

    assert.equal(project.maps.length, 1)
    assert.deepEqual(project.maps[0].layers, [])
    assert.equal(project.maps[0].tileMap.width, DEFAULT_MAP_SIZE.width)
    assert.equal(project.maps[0].tileMap.layers.length, 2)
    assert.deepEqual(project.tilesets, [])
})

test('a project file from before tile maps gets a grid and an empty tileset list', () => {
    const stored = {
        id: 'p',
        name: 'Old',
        maps: [{ id: 'm', name: 'Legacy map', layers: [layer('a')] }],
    }
    const project = withProjectDefaults(stored as never)

    assert.deepEqual(project.tilesets, [])
    assert.equal(project.maps[0].tileMap.height, DEFAULT_MAP_SIZE.height)
    assert.deepEqual(project.maps[0].layers.map(l => l.uuid), ['a'])
})

test('adding a map keeps the first and does not mutate the input', () => {
    const first = newMap('Town')
    const project = projectFromLegacyLayers([])
    const withTown = addMap(project, first)
    const withHouse = addMap(withTown, newMap('House'))

    assert.equal(project.maps.length, 1)
    assert.equal(withHouse.maps.length, 3)
    assert.equal(findMap(withHouse, first.id)?.name, 'Town')
})

test('renaming an unknown map changes nothing', () => {
    const project = addMap(defaultProject(), newMap('Town'))
    const renamed = renameMap(project, 'missing', 'Nope')

    assert.deepEqual(renamed.maps.map(m => m.name), project.maps.map(m => m.name))
})

test('renaming a map changes only that map', () => {
    const town = newMap('Town')
    const project = addMap(defaultProject(), town)
    const renamed = renameMap(project, town.id, 'Littleroot')

    assert.equal(findMap(renamed, town.id)?.name, 'Littleroot')
    assert.equal(renamed.maps[0].name, 'Map 1')
})

test('replacing layers touches only the named map', () => {
    const town = newMap('Town')
    const project = addMap(defaultProject(), town)
    const updated = withMapLayers(project, town.id, [layer('x')])

    assert.deepEqual(findMap(updated, town.id)?.layers.map(l => l.uuid), ['x'])
    assert.deepEqual(updated.maps[0].layers, [])
})

test('a map name must have visible characters', () => {
    assert.equal(isValidMapName('Town'), true)
    assert.equal(isValidMapName('   '), false)
    assert.equal(isValidMapName(3), false)
    assert.equal(isValidMapName(undefined), false)
})

test('a map spawns in its centre, and an old file without a spawn gets one', () => {
    const map = newMap('Town', [], { width: 10, height: 6 })
    const stored = { id: 'p', name: 'P', maps: [{ id: map.id, name: map.name, tileMap: map.tileMap, layers: [] }] }

    assert.deepEqual(map.spawn, { x: 5, y: 3 })
    assert.deepEqual(withProjectDefaults(stored as never).maps[0].spawn, { x: 5, y: 3 })
})

test('a spawn left outside a resized grid moves back to the centre', () => {
    const map = { ...newMap('Town', [], { width: 10, height: 10 }), spawn: { x: 9, y: 9 } }
    const project = addMap(defaultProject(), map)
    const smaller = { ...map.tileMap, width: 4, height: 4 }

    assert.deepEqual(findMap(withMapTileMap(project, map.id, smaller), map.id)?.spawn, { x: 2, y: 2 })
})

test('play starts on the chosen map, falls back to the first, and forgets a deleted start map', () => {
    const a = newMap('A')
    const b = newMap('B')
    const project = addMap(addMap(defaultProject(), a), b)

    assert.equal(startMap(project)?.name, 'Map 1')
    assert.equal(startMap(withStartMap(project, b.id))?.id, b.id)
    assert.equal(withStartMap(project, 'nope').startMapId, null)

    const without = removeMap(withStartMap(project, b.id), b.id)

    assert.equal(without.startMapId, null)
    assert.equal(startMap(without)?.name, 'Map 1')
    assert.equal(startMap({ ...project, maps: [] }), undefined)
})
