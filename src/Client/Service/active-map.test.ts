import test from 'node:test'
import assert from 'node:assert/strict'
import { activeMapId, urlForMap } from './active-map'
import { Project } from '../../domain/project'

/** Only `maps[].id` matters here; the grids are irrelevant to the rule. */
const project = {
    id: 'p',
    name: 'Game',
    tilesets: [],
    maps: [
        { id: 'town', name: 'Town' },
        { id: 'house', name: 'House' },
    ],
} as unknown as Project

test('a requested map that exists wins', () => {
    assert.equal(activeMapId('?map=house', project), 'house')
})

test('an unknown or missing request falls back to the first map', () => {
    assert.equal(activeMapId('?map=nowhere', project), 'town')
    assert.equal(activeMapId('', project), 'town')
})

test('a project without maps has no active map', () => {
    assert.equal(activeMapId('?map=town', { ...project, maps: [] }), undefined)
})

test('urlForMap keeps the page and sets the map', () => {
    assert.equal(urlForMap('/play', 'house'), '/play?map=house')
})
