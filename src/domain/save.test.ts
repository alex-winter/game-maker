import test from 'node:test'
import assert from 'node:assert/strict'
import { parseSave, SavedSession, serializeSave } from './save'

const session: SavedSession = {
    mapId: 'house',
    cell: { x: 3, y: 4 },
    facing: 'up',
    memory: { flags: ['took-potion'], variables: { steps: 12 } },
    bag: [{ itemId: 'potion', count: 1 }],
    party: [{ speciesId: 'sprout', level: 5, hp: 20, experience: 125, moves: ['tackle'] }],
}

test('a session round-trips through serialize and parse, with the time kept on the slot', () => {
    const document = serializeSave(session, '2026-11-06T10:00:00.000Z')
    const parsed = parseSave(JSON.parse(JSON.stringify(document)))

    assert.equal(document.version, 1)
    assert.equal(document.slots[0]?.savedAt, '2026-11-06T10:00:00.000Z')
    assert.deepEqual(parsed, { ok: true, session })
})

test('parse refuses the wrong version, no slot, and a malformed slot, each with a reason', () => {
    assert.deepEqual(parseSave({ version: 2, slots: [] }), { ok: false, reason: 'Save version 2 is not 1' })
    assert.deepEqual(parseSave({ version: 1, slots: [] }), { ok: false, reason: 'The save has no slot' })
    assert.equal(parseSave({ version: 1, slots: [{ ...session, facing: 'sideways' }] }).ok, false)
    assert.equal(parseSave({ version: 1, slots: [{ ...session, bag: 'full' }] }).ok, false)
    assert.equal(parseSave(null).ok, false)
})

test('a save written before parties resumes with nobody in the party', () => {
    const { party: _party, ...older } = session
    const result = parseSave({ version: 1, slots: [{ ...older, savedAt: '2026-01-01T00:00:00Z' }] })

    assert.ok(result.ok)
    assert.deepEqual(result.session.party, [])
    assert.equal(parseSave({ version: 1, slots: [{ ...older, party: 'everyone', savedAt: 'x' }] }).ok, false)
})
