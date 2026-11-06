import test from 'node:test'
import assert from 'node:assert/strict'
import { newSpriteDefinition, withFrame } from '../domain/sprite'
import { newNpcEvent } from '../domain/warp'
import { NPC_COLOR, npcActor } from './npc-actor'

test('an NPC draws their sprite\'s idle pose for the facing, standing on the cell, or a blue cell without one', () => {
    const sprite = withFrame(newSpriteDefinition('hero', 'Hero', 'sheet', 16, 32), 'left', 'idle', { x: 0, y: 64, width: 16, height: 32 })
    const mom = newNpcEvent('mom', { x: 2, y: 3 }, 'Mom', 'hero', 'left', null)
    const lookup = (id: string) => (id === 'hero' ? { sprite, image: 'img' } : undefined)

    assert.deepEqual(npcActor(mom, 'left', lookup), {
        x: 32, y: 32, width: 16, height: 32, color: NPC_COLOR,
        sprite: { image: 'img', sx: 0, sy: 64, sw: 16, sh: 32 },
    })
    assert.deepEqual(npcActor({ ...mom, spriteId: null }, 'left', lookup), { x: 32, y: 48, width: 16, height: 16, color: NPC_COLOR })
    assert.equal(npcActor({ ...mom, spriteId: 'gone' }, 'left', lookup).sprite, undefined)
})
