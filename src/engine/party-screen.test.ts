import test from 'node:test'
import assert from 'node:assert/strict'
import { drawPartyScreen, movePartyCursor, openPartyScreen, partyRow } from './party-screen'
import { newMove, newSpecies, starterParty } from '../domain/creature'
import { DrawPort } from './draw-port'

const tackle = newMove('tackle', 'Tackle')
const sprout = newSpecies('sprout', 'Sprout', ['grass'], undefined, [{ level: 1, moveId: 'tackle' }])
const lookup = { speciesOf: (id: string) => (id === 'sprout' ? sprout : undefined), moveName: (id: string) => (id === 'tackle' ? tackle.name : undefined) }

test('a starter shows with its level and HP, and the cursor stops at the ends', () => {
    const party = starterParty({ speciesId: 'sprout', level: 7 }, [sprout])

    assert.deepEqual(partyRow(party[0], lookup), { name: 'SPROUT', level: 'Lv7', hp: '28/28' })
    assert.deepEqual(movePartyCursor(openPartyScreen(), 1, 1), { highlight: 0 })
    assert.deepEqual(movePartyCursor(openPartyScreen(), 1, 2), { highlight: 1 })
    assert.deepEqual(movePartyCursor({ highlight: 1 }, -1, 2), { highlight: 0 })
    assert.deepEqual(movePartyCursor({ highlight: 3 }, 1, 0), { highlight: 0 })
})

test('drawing lists each creature and the highlighted one\'s moves; an empty party says so', () => {
    const texts: string[] = []
    const port: DrawPort<unknown> = { width: 480, height: 320, clear: () => undefined, fillRect: () => undefined, fillText: text => texts.push(text), drawImage: () => undefined }
    const party = [...starterParty({ speciesId: 'sprout', level: 7 }, [sprout]), { ...starterParty({ speciesId: 'sprout', level: 3 }, [sprout])[0], hp: 0 }]

    drawPartyScreen(port, party, lookup, { highlight: 0 }, { width: 240, height: 160 }, 2)
    assert.ok(texts.includes('PARTY'))
    assert.ok(texts.includes('Lv7') && texts.includes('Lv3'))
    assert.ok(texts.includes('28/28') && texts.includes('0/20'))
    assert.ok(texts.includes('MOVES') && texts.includes('TACKLE'))
    assert.ok(texts.includes('GRASS'))

    texts.length = 0
    drawPartyScreen(port, [], lookup, openPartyScreen(), { width: 240, height: 160 }, 2)
    assert.ok(texts.includes('Nobody yet.'))
    assert.ok(!texts.includes('MOVES'))
})
