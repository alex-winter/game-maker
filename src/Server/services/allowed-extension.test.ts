import test from 'node:test'
import assert from 'node:assert/strict'
import { allowedExtension } from './allowed-extension'

const allowed = ['.png', '.jpg', '.jpeg']

test('returns the lower-cased extension when it is allowed', () => {
    assert.equal(allowedExtension('a.png', allowed), '.png')
    assert.equal(allowedExtension('Photo.JPG', allowed), '.jpg')
})

test('rejects extensions outside the list and names without one', () => {
    assert.equal(allowedExtension('notes.txt', allowed), undefined)
    assert.equal(allowedExtension('README', allowed), undefined)
    assert.equal(allowedExtension('trailing.', allowed), undefined)
})

test('a traversal or separator in the name cannot leak into the extension', () => {
    assert.equal(allowedExtension('../outside.png', allowed), '.png')
    assert.equal(allowedExtension('a.png/../../etc', allowed), undefined)
    assert.equal(allowedExtension('a.png\\x', allowed), undefined)
})
