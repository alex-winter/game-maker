import test from 'node:test'
import assert from 'node:assert/strict'
import { imageMimeType } from './image-mime'

test('jpg and jpeg are image/jpeg, not image/jpg', () => {
    assert.equal(imageMimeType('a.jpg'), 'image/jpeg')
    assert.equal(imageMimeType('a.JPEG'), 'image/jpeg')
})

test('png, gif, and webp map to their types', () => {
    assert.equal(imageMimeType('a.png'), 'image/png')
    assert.equal(imageMimeType('a.gif'), 'image/gif')
    assert.equal(imageMimeType('a.webp'), 'image/webp')
})

test('unknown or missing extensions are undefined', () => {
    assert.equal(imageMimeType('a.txt'), undefined)
    assert.equal(imageMimeType('noext'), undefined)
})
