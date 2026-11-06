import test from 'node:test'
import assert from 'node:assert/strict'
import { parseDataset } from './parse-dataset'

test('objects and arrays are parsed, plain strings stay strings', () => {
    const parsed = parseDataset({
        layer: '{"uuid":"a","order":2}',
        list: '[1,2]',
        title: 'Sheet 1',
        id: '81039e76-6210-4b76-899b-fefc6766ff69',
        count: '60',
    })

    assert.deepEqual(parsed.layer, { uuid: 'a', order: 2 })
    assert.deepEqual(parsed.list, [1, 2])
    assert.equal(parsed.title, 'Sheet 1')
    assert.equal(parsed.id, '81039e76-6210-4b76-899b-fefc6766ff69')
    assert.equal(parsed.count, '60')
})

test('a string that only looks like JSON is kept as text', () => {
    assert.equal(parseDataset({ note: '{not json' }).note, '{not json')
})

test('undefined entries are skipped', () => {
    assert.deepEqual(parseDataset({ a: undefined, b: 'x' }), { b: 'x' })
})

test('booleans and null come back typed, numbers stay text', () => {
    const parsed = parseDataset({ on: 'true', off: 'false', nothing: 'null', count: '42' })

    assert.deepEqual(parsed, { on: true, off: false, nothing: null, count: '42' })
})
