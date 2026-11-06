import test from 'node:test'
import assert from 'node:assert/strict'
import { isLayerList } from './is-layer-list'

test('accepts an array whose entries carry a string uuid', () => {
    assert.equal(isLayerList([{ uuid: 'a' }, { uuid: 'b', name: 'ground' }]), true)
    assert.equal(isLayerList([]), true)
})

test('rejects anything that is not an array', () => {
    assert.equal(isLayerList({}), false)
    assert.equal(isLayerList({ uuid: 'a' }), false)
    assert.equal(isLayerList(null), false)
    assert.equal(isLayerList('layers'), false)
})

test('rejects an array with an entry that lacks a string uuid', () => {
    assert.equal(isLayerList([{ uuid: 'a' }, { name: 'no uuid' }]), false)
    assert.equal(isLayerList([{ uuid: 1 }]), false)
    assert.equal(isLayerList([null]), false)
})
