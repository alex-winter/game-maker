import test from 'node:test'
import assert from 'node:assert/strict'
import { insideMap, WALK_MS_PER_CELL } from '../domain/movement'
import { MIN_PAUSE_MS } from '../domain/npc-behavior'
import { maxHpAt, newSpecies, starterParty } from '../domain/creature'
import { newPage } from '../domain/dialog'
import { newItemEvent, newNpcEvent, newSign, newWarp } from '../domain/warp'
import { bagCount } from '../domain/item'
import { hasFlag, newMemory, setFlag } from '../domain/flags'
import { FADE_MS, fadeOpacity } from './fade'
import { advanceField, afterBattle, afterSave, FieldInput, FieldState, FieldWorld, isTransitioning, liveEvents, newField, npcMover, restoreField, snapshotField } from './field'

const town = { width: 10, height: 10 }
const house = { width: 6, height: 6 }
const door = newWarp('door', { x: 5, y: 4 }, 'house', { x: 3, y: 5 }, 'up')

const world: FieldWorld = {
    sizeOf: id => (id === 'town' ? town : id === 'house' ? house : undefined),
    canEnter: id => insideMap(id === 'town' ? town : house),
    isSolidAt: () => false,
    connectionsOf: id => (id === 'town' ? { south: { mapId: 'house', offset: -2 } } : {}),
    eventsOf: id => (id === 'town' ? [door, newSign('sign', { x: 6, y: 5 }, 'welcome')] : []),
    pagesOf: id => (id === 'welcome' ? [newPage('Welcome!'), newPage('Enjoy your stay.')]
        : id === 'ask' ? [newPage('Take the boat?', [{ label: 'Yes', nextDialogId: 'boat' }, { label: 'No', nextDialogId: null }])]
        : id === 'boat' ? [newPage('Off you go.')]
        : undefined),
    itemOf: id => (id === 'potion' ? { name: 'Potion', description: 'Heals 20 HP.' } : undefined),
    random: () => 0,
    isGrassAt: () => false,
    encountersOf: () => undefined,
    speciesName: id => (id === 'sprout' ? 'Sprout' : undefined),
}

const right = { direction: 'right' as const, running: false, interact: false, menu: false }
const up = { direction: 'up' as const, running: false, interact: false, menu: false }
const down = { direction: 'down' as const, running: false, interact: false, menu: false }
const none = { direction: null, running: false, interact: false, menu: false }

function run(state: FieldState, input: FieldInput, ms: number, step = 16): FieldState {
    for (let t = 0; t < ms; t += step) {
        state = advanceField(state, input, step, world)
    }

    return state
}

test('stepping onto the door starts a fade, swaps the map when the screen is black, and lands on the warp cell', () => {
    let state = newField('town', { x: 5, y: 5 })

    state = run(state, up, WALK_MS_PER_CELL + 16)
    assert.equal(isTransitioning(state), true, 'fade began when the step finished on the door')
    assert.equal(state.mapId, 'town', 'still on the town while fading out')

    state = run(state, up, FADE_MS)
    assert.equal(state.mapId, 'house', 'swapped at black')
    assert.deepEqual(state.player.cell, { x: 3, y: 5 })
    assert.equal(state.player.facing, 'up')
    assert.ok(fadeOpacity(state.fade) > 0.5, 'still dark, fading in')
})

test('input is refused mid-fade and accepted after it', () => {
    let state = newField('town', { x: 5, y: 5 })

    state = run(state, up, WALK_MS_PER_CELL + 16)
    assert.equal(isTransitioning(state), true)

    const during = advanceField(state, right, 16, world)

    assert.equal(during.player.step, null, 'no step begins during the fade')
    assert.equal(during.player.facing, 'up', 'not even a turn')

    state = run(state, none, FADE_MS * 2 + 32)
    assert.equal(isTransitioning(state), false)

    const after = advanceField(state, right, 16, world)

    assert.notEqual(after.player.step, null, 'steps again once the fade is over')
    assert.equal(after.player.facing, 'right')
})

test('walking off a connected edge fades too and lands on the neighbour with the offset applied', () => {
    let state = newField('town', { x: 4, y: 9 }, 'down')

    state = run(state, down, WALK_MS_PER_CELL + 16)
    assert.equal(isTransitioning(state), true)

    state = run(state, none, FADE_MS + 16)
    assert.equal(state.mapId, 'house')
    assert.deepEqual(state.player.cell, { x: 2, y: 0 })
    assert.equal(state.player.facing, 'down')
})

test('arriving on a warp cell does not fire it again', () => {
    const arrived = { ...newField('town', { x: 5, y: 4 }), fade: null }
    const next = advanceField(arrived, none, 16, world)

    assert.equal(isTransitioning(next), false)
})

test('the interact key reports the sign in front and does not move the player, even with a direction held', () => {
    const facing = newField('town', { x: 5, y: 5 }, 'right')
    const pressed = advanceField(facing, { ...right, interact: true }, 16, world)

    assert.deepEqual(pressed.interaction, { kind: 'sign', eventId: 'sign', dialogId: 'welcome' })
    assert.equal(pressed.player.step, null)
    assert.deepEqual(pressed.player.cell, { x: 5, y: 5 })

    const next = advanceField(pressed, none, 16, world)

    assert.equal(next.interaction, undefined, 'cleared the next frame')

    const nothing = advanceField(newField('town', { x: 5, y: 5 }, 'left'), { ...none, interact: true }, 16, world)

    assert.equal(nothing.interaction, undefined)
})

test('a sign opens its dialog; movement does nothing while it is open; the interact key pages and closes it', () => {
    const facing = newField('town', { x: 5, y: 5 }, 'right')
    const opened = advanceField(facing, { ...none, interact: true }, 16, world)

    assert.deepEqual(opened.message, { pages: [newPage('Welcome!'), newPage('Enjoy your stay.')], index: 0, highlight: 0 })

    const walking = advanceField(opened, { direction: 'down', running: true, interact: false, menu: false }, 500, world)

    assert.deepEqual(walking.player.cell, { x: 5, y: 5 })
    assert.equal(walking.player.step, null)
    assert.equal(walking.player.facing, 'right')
    assert.equal(walking.message?.index, 0)

    const paged = advanceField(walking, { ...none, interact: true }, 16, world)

    assert.equal(paged.message?.index, 1)

    const closed = advanceField(paged, { ...none, interact: true }, 16, world)

    assert.equal(closed.message, null)
    assert.equal(closed.interaction, undefined, 'closing the box is not a new look')

    const stepping = advanceField(closed, right, 16, world)

    assert.notEqual(stepping.player.step, null, 'walking resumes once the box is closed')
})

test('a sign whose dialog does not exist says so instead of opening nothing', () => {
    const lost: FieldWorld = { ...world, pagesOf: () => undefined }
    const opened = advanceField(newField('town', { x: 5, y: 5 }, 'right'), { ...none, interact: true }, 16, lost)

    assert.deepEqual(opened.message?.pages, [newPage('(No dialog "welcome" exists yet.)')])
})

test('a held direction moves the choice cursor once; a fresh press moves it again; confirm takes the highlighted branch', () => {
    const asking: FieldWorld = { ...world, eventsOf: () => [newSign('sign', { x: 6, y: 5 }, 'ask')] }
    const opened = advanceField(newField('town', { x: 5, y: 5 }, 'right'), { ...none, interact: true }, 16, asking)

    assert.equal(opened.message?.highlight, 0)

    const held1 = advanceField(opened, down, 16, asking)
    const held2 = advanceField(held1, down, 16, asking)

    assert.equal(held1.message?.highlight, 1)
    assert.equal(held2.message?.highlight, 1, 'holding does not keep moving')
    assert.deepEqual(held2.player.cell, { x: 5, y: 5 }, 'and never walks')

    const released = advanceField(held2, none, 16, asking)
    const up = advanceField(released, { ...down, direction: 'up' }, 16, asking)

    assert.equal(up.message?.highlight, 0)

    const second = advanceField(advanceField(up, none, 16, asking), down, 16, asking)
    const confirmed = advanceField(second, { ...none, interact: true }, 16, asking)

    assert.equal(confirmed.message, null, '"No" ends the conversation')

    const yes = advanceField(opened, { ...none, interact: true }, 16, asking)

    assert.deepEqual(yes.message?.pages, [newPage('Off you go.')], '"Yes" opens the linked dialog')
})

test('an item on the floor blocks the step, is picked up once with a message, then is gone and the cell opens', () => {
    const potion = newItemEvent('ball', { x: 6, y: 5 }, 'potion', 'took-potion', 7)
    const floor: FieldWorld = { ...world, eventsOf: () => [potion] }
    const start = newField('town', { x: 5, y: 5 }, 'right')

    const walkedInto = advanceField(start, right, 16, floor)

    assert.equal(walkedInto.player.step, null, 'the item blocks like a solid cell')

    const found = advanceField(start, { ...none, interact: true }, 16, floor)

    assert.deepEqual(found.message?.pages[0]?.text, 'You found a POTION!')
    assert.equal(bagCount(found.bag, 'potion'), 1)
    assert.equal(hasFlag(found.memory, 'took-potion'), true)

    const closed = advanceField(found, { ...none, interact: true }, 16, floor)

    assert.equal(closed.message, null)

    const again = advanceField(closed, { ...none, interact: true }, 16, floor)

    assert.equal(again.interaction, undefined, 'a taken item is not there to interact with')
    assert.equal(again.message, null)
    assert.equal(bagCount(again.bag, 'potion'), 1)

    const walkedOnto = advanceField(closed, right, 16, floor)

    assert.notEqual(walkedOnto.player.step, null, 'the cell is open once the item is gone')
})

test('the menu key opens the start menu, the player stands, the cursor moves, Close or the menu key closes it, and walking resumes', () => {
    const opened = advanceField(newField('town', { x: 5, y: 5 }), { ...none, menu: true }, 16, world)

    assert.deepEqual(opened.menu, { highlight: 0 })

    const held = advanceField(opened, { ...right, direction: 'down' }, 300, world)

    assert.deepEqual(held.player.cell, { x: 5, y: 5 })
    assert.equal(held.player.step, null)
    assert.equal(held.menu?.highlight, 1)

    const toggled = advanceField(held, { ...none, menu: true }, 16, world)

    assert.equal(toggled.menu, null)
    assert.equal(toggled.menuChoice, undefined)

    const again = advanceField(toggled, { ...none, menu: true }, 16, world)
    const onParty = advanceField(again, down, 16, world)
    const onSave = advanceField(advanceField(onParty, none, 16, world), down, 16, world)
    const confirmedSave = advanceField(advanceField(onSave, none, 16, world), { ...none, interact: true }, 16, world)

    assert.equal(confirmedSave.menuChoice, 'save', 'the host sees which entry was chosen')
    assert.notEqual(confirmedSave.menu, null, 'an entry without a screen leaves the menu open')

    const nextFrame = advanceField(confirmedSave, none, 16, world)

    assert.equal(nextFrame.menuChoice, undefined, 'cleared the next frame')

    const onClose = advanceField(nextFrame, down, 16, world)
    const closed = advanceField(advanceField(onClose, none, 16, world), { ...none, interact: true }, 16, world)

    assert.equal(closed.menuChoice, 'close')
    assert.equal(closed.menu, null)

    const walking = advanceField(closed, right, 16, world)

    assert.notEqual(walking.player.step, null)
})

test('the menu does not open over a message or mid-step', () => {
    const reading = advanceField(newField('town', { x: 5, y: 5 }, 'right'), { ...none, interact: true }, 16, world)
    const tried = advanceField(reading, { ...none, menu: true }, 16, world)

    assert.equal(tried.menu, null)
    assert.notEqual(tried.message, null)

    const stepping = advanceField(newField('town', { x: 5, y: 5 }), right, 16, world)
    const midStep = advanceField(stepping, { ...right, menu: true }, 16, world)

    assert.equal(midStep.menu, null)
})

test('a save snapshots the standing cell, memory, and bag, and restoring it resumes there', () => {
    const potion = newItemEvent('ball', { x: 6, y: 5 }, 'potion', 'took-potion', 7)
    const floor: FieldWorld = { ...world, eventsOf: () => [potion] }
    const found = advanceField(newField('town', { x: 5, y: 5 }, 'right'), { ...none, interact: true }, 16, floor)
    const closed = advanceField(found, { ...none, interact: true }, 16, floor)
    const stepping = advanceField(closed, down, 16, floor)

    assert.notEqual(stepping.player.step, null)

    const saved = snapshotField(stepping)

    assert.deepEqual(saved, {
        mapId: 'town',
        cell: { x: 5, y: 6 },
        facing: 'down',
        memory: { flags: ['took-potion'], variables: {} },
        bag: [{ itemId: 'potion', count: 1 }],
        party: [],
    })

    const restored = restoreField(saved)

    assert.deepEqual(restored.player.cell, { x: 5, y: 6 })
    assert.equal(restored.player.facing, 'down')
    assert.equal(bagCount(restored.bag, 'potion'), 1)
    assert.equal(hasFlag(restored.memory, 'took-potion'), true)
    assert.equal(restored.menu, null)

    const notice = afterSave({ ...restored, menu: { highlight: 2 } })

    assert.equal(notice.menu, null)
    assert.equal(notice.message?.pages[0]?.text, 'Saved the game.')
})

test('Bag in the menu opens the bag screen, which holds the player, moves its cursor, and steps back to the menu', () => {
    const potion = newItemEvent('ball', { x: 6, y: 5 }, 'potion', 'took-potion', 7)
    const rope = newItemEvent('coil', { x: 4, y: 5 }, 'rope', 'took-rope', null)
    const floor: FieldWorld = { ...world, eventsOf: () => [potion, rope] }
    let state = newField('town', { x: 5, y: 5 }, 'right')

    state = advanceField(state, { ...none, interact: true }, 16, floor)   // potion
    state = advanceField(state, { ...none, interact: true }, 16, floor)   // close
    state = advanceField(state, { ...none, direction: 'left' }, 16, floor) // turn (blocked by the rope)
    state = advanceField(state, none, 16, floor)
    state = advanceField(state, { ...none, interact: true }, 16, floor)   // rope
    state = advanceField(state, { ...none, interact: true }, 16, floor)
    assert.equal(state.bag.length, 2)

    const menu = advanceField(state, { ...none, menu: true }, 16, floor)
    const opened = advanceField(menu, { ...none, interact: true }, 16, floor)

    assert.equal(opened.menuChoice, 'bag')
    assert.deepEqual(opened.bagScreen, { highlight: 0 })
    assert.notEqual(opened.menu, null, 'the menu waits underneath')

    const moved = advanceField(opened, { ...down, running: true }, 400, floor)

    assert.equal(moved.bagScreen?.highlight, 1)
    assert.deepEqual(moved.player.cell, { x: 5, y: 5 })
    assert.equal(moved.player.step, null)

    const back = advanceField(moved, { ...none, menu: true }, 16, floor)

    assert.equal(back.bagScreen, null)
    assert.notEqual(back.menu, null, 'back on the menu, not in the field')

    const field = advanceField(back, { ...none, menu: true }, 16, floor)

    assert.equal(field.menu, null)
})

test('a person standing on a cell blocks the step like a wall', () => {
    const mom = newNpcEvent('mom', { x: 6, y: 5 }, 'Mom', null, 'down', null)
    const peopled: FieldWorld = { ...world, eventsOf: () => [mom] }
    const tried = advanceField(newField('town', { x: 5, y: 5 }), right, 16, peopled)

    assert.equal(tried.player.step, null)
    assert.equal(tried.player.facing, 'right')
})

test('talking to a person opens their dialog with choices, turns them to face the player, and turns them back when it ends', () => {
    const mom = newNpcEvent('mom', { x: 6, y: 5 }, 'Mom', null, 'down', 'ask')
    const peopled: FieldWorld = { ...world, eventsOf: () => [mom] }
    const talking = advanceField(newField('town', { x: 5, y: 5 }, 'right'), { ...none, interact: true }, 16, peopled)

    assert.equal(talking.message?.pages[0]?.text, 'Take the boat?')
    assert.deepEqual(talking.talkingTo, { eventId: 'mom', facing: 'left' })
    assert.equal(npcMover(talking, mom).facing, 'left')

    const chose = advanceField(advanceField(talking, down, 16, peopled), { ...none, interact: true }, 16, peopled)

    assert.equal(chose.message, null, '"No" ends it')
    assert.equal(chose.talkingTo, null)
    assert.equal(npcMover(chose, mom).facing, 'down', 'back to her own facing')

    const yes = advanceField(talking, { ...none, interact: true }, 16, peopled)

    assert.equal(yes.message?.pages[0]?.text, 'Off you go.', 'the branch opens while still talking')
    assert.equal(npcMover(yes, mom).facing, 'left')
})

test('a person with nothing to say says so, so the author knows who to write for', () => {
    const quiet = newNpcEvent('kid', { x: 6, y: 5 }, 'Kid', null, 'up', null)
    const peopled: FieldWorld = { ...world, eventsOf: () => [quiet] }
    const talking = advanceField(newField('town', { x: 5, y: 5 }, 'right'), { ...none, interact: true }, 16, peopled)

    assert.equal(talking.message?.pages[0]?.text, '(Kid has nothing to say yet.)')
})

test('a wanderer steps when their pause runs out, blocks the player where they stand and where they land, and the interact key finds them there', () => {
    // Random 0.8 → right, always. Pauses are the minimum.
    const walker = newNpcEvent('walker', { x: 7, y: 5 }, 'Walker', null, 'down', 'welcome', 'wander')
    const roaming: FieldWorld = { ...world, eventsOf: () => [walker], random: () => 0.8 }
    let state = newField('town', { x: 5, y: 5 }, 'right')

    for (let t = 0; t < MIN_PAUSE_MS + 32; t += 16) {
        state = advanceField(state, none, 16, roaming)
    }

    const motion = state.people[0]

    assert.ok(motion.mover.step !== null, 'set off')
    assert.deepEqual(motion.mover.step.to, { x: 8, y: 5 })

    // The player walks right: (6,5) is free, (7,5) is still the walker's until the step lands.
    let chasing = state

    for (let t = 0; t < WALK_MS_PER_CELL / 2; t += 16) {
        chasing = advanceField(chasing, right, 16, roaming)
    }

    assert.deepEqual(chasing.player.step?.to, { x: 6, y: 5 })
    assert.equal(chasing.people[0].mover.step?.to.x, 8, 'the walker keeps going too')

    for (let t = 0; t < WALK_MS_PER_CELL * 2; t += 16) {
        chasing = advanceField(chasing, right, 16, roaming)
    }

    // The walker landed on (8,5) and pauses; the player reached (7,5) and cannot enter (8,5) behind them.
    assert.deepEqual(chasing.people[0].mover, { cell: { x: 8, y: 5 }, facing: 'right', step: null })
    assert.deepEqual(chasing.player, { cell: { x: 7, y: 5 }, facing: 'right', step: null })

    // The interact key finds the walker where they now stand, not where they were placed.
    assert.deepEqual(liveEvents(chasing, [walker])[0].cell, { x: 8, y: 5 })

    const talking = advanceField(chasing, { ...none, interact: true }, 16, roaming)

    assert.equal(talking.message?.pages[0]?.text, 'Welcome!')
    assert.equal(npcMover(talking, walker).facing, 'left', 'turned to the player beside them')
})

test('the player cannot step into a person who is only part way out of a cell', () => {
    const walker = newNpcEvent('walker', { x: 6, y: 5 }, 'Walker', null, 'down', null, 'wander')
    const roaming: FieldWorld = { ...world, eventsOf: () => [walker], random: () => 0.8 }
    let state = newField('town', { x: 5, y: 5 }, 'right')

    for (let t = 0; t < MIN_PAUSE_MS + 32; t += 16) {
        state = advanceField(state, none, 16, roaming)
    }

    assert.deepEqual(state.people[0].mover.step?.from, { x: 6, y: 5 })

    const pushed = advanceField(state, right, 16, roaming)

    assert.equal(pushed.player.step, null, 'blocked by the cell being left')
})

test('a looker turns in place while the field runs and holds their pose while a message is open', () => {
    const looker = newNpcEvent('looker', { x: 8, y: 8 }, 'Looker', null, 'down', null, 'look')
    const sign = newSign('sign', { x: 6, y: 5 }, 'welcome')
    const peopled: FieldWorld = { ...world, eventsOf: () => [looker, sign], random: () => 0.1 }
    let state = newField('town', { x: 5, y: 5 }, 'right')

    for (let t = 0; t < MIN_PAUSE_MS + 32; t += 16) {
        state = advanceField(state, none, 16, peopled)
    }

    assert.equal(npcMover(state, looker).facing, 'up')
    assert.deepEqual(npcMover(state, looker).cell, { x: 8, y: 8 }, 'never moved')

    let reading = advanceField(state, { ...none, interact: true }, 16, peopled)

    assert.ok(reading.message !== null)

    for (let t = 0; t < 5000; t += 16) {
        reading = advanceField(reading, none, 16, peopled)
    }

    assert.equal(npcMover(reading, looker).facing, 'up', 'paused with the field')
})

test('a wanderer never steps onto an item or another person', () => {
    const potion = newItemEvent('potion-1', { x: 8, y: 5 }, 'potion', 'took-potion', null)
    const pal = newNpcEvent('pal', { x: 7, y: 4 }, 'Pal', null, 'down', null, 'still')
    const walker = newNpcEvent('walker', { x: 7, y: 5 }, 'Walker', null, 'down', null, 'wander')
    const directions = [0.1, 0.8, 0.3, 0.6]
    let pick = 0
    const crowded: FieldWorld = { ...world, eventsOf: () => [potion, pal, walker], random: () => directions[pick++ % directions.length] }
    let state = newField('town', { x: 1, y: 1 }, 'right')

    for (let t = 0; t < 20000; t += 16) {
        state = advanceField(state, none, 16, crowded)

        const walkerMotion = state.people.find(motion => motion.eventId === 'walker')

        assert.ok(walkerMotion !== undefined)

        for (const cell of [walkerMotion.mover.cell, ...(walkerMotion.mover.step === null ? [] : [walkerMotion.mover.step.to])]) {
            assert.ok(!(cell.x === 8 && cell.y === 5), 'not onto the potion')
            assert.ok(!(cell.x === 7 && cell.y === 4), 'not onto Pal')
        }
    }
})

test('a new game carries the starter at the authored level with full HP, and a save keeps the party', () => {
    const sprout = newSpecies('sprout', 'Sprout')
    const party = starterParty({ speciesId: 'sprout', level: 5 }, [sprout])
    const state = newField('town', { x: 5, y: 5 }, 'down', undefined, undefined, party)

    assert.equal(state.party.length, 1)
    assert.equal(state.party[0].level, 5)
    assert.equal(state.party[0].hp, maxHpAt(sprout, 5))
    assert.deepEqual(restoreField(snapshotField(state)).party, party)
})

test('a step that finishes in tall grass rolls on the map\'s table and hands the host a battle request; the player stops there', () => {
    const sprout = newSpecies('sprout', 'Sprout')
    const party = starterParty({ speciesId: 'sprout', level: 5 }, [sprout])
    const table = { rate: 100, entries: [{ speciesId: 'sprout', minLevel: 3, maxLevel: 3, weight: 1 }] }
    const wild: FieldWorld = { ...world, isGrassAt: (_map, cell) => cell.x === 6 && cell.y === 5, encountersOf: () => table, random: () => 0 }
    let state = newField('town', { x: 5, y: 5 }, 'right', undefined, undefined, party)

    for (let t = 0; t < WALK_MS_PER_CELL + 16; t += 16) {
        state = advanceField(state, right, 16, wild)
    }

    assert.deepEqual(state.battle, { party, speciesId: 'sprout', level: 3, trainer: null })
    assert.deepEqual(state.player, { cell: { x: 6, y: 5 }, facing: 'right', step: null }, 'stopped in the grass though the key is held')

    const result = afterBattle(state, { outcome: 'won', party }, 'Sprout')

    assert.equal(result.battle, undefined)
    assert.equal(result.message?.pages[0]?.text, 'A wild SPROUT appeared!')
    assert.match(result.message?.pages[1]?.text ?? '', /You won/)
    assert.equal(result.memory.variables['battles-won'], 1)
    assert.deepEqual(result.party, party)

    // Walking on from plain ground rolls nothing, and a quiet table rolls nothing in the grass either.
    const quiet: FieldWorld = { ...wild, encountersOf: () => ({ rate: 0, entries: table.entries }) }
    let calm = newField('town', { x: 5, y: 5 }, 'right', undefined, undefined, party)

    for (let t = 0; t < WALK_MS_PER_CELL * 3; t += 16) {
        calm = advanceField(calm, right, 16, quiet)
        assert.equal(calm.battle, undefined)
    }

    assert.ok(calm.player.cell.x >= 7, 'walked straight through')
})

// T-049: a trainer at (2, 5) looking right sees three cells: (3, 5), (4, 5), (5, 5).
const trainer = newNpcEvent('ace', { x: 2, y: 5 }, 'Ace', null, 'right', null, 'still', { sightRange: 3, defeatedFlagId: 'beat-ace', speciesId: 'sprout', level: 5 })
const watched: FieldWorld = { ...world, eventsOf: () => [trainer] }

test('a trainer who sees the player walks up along empty cells and issues the challenge once they stand beside them', () => {
    const party = starterParty({ speciesId: 'sprout', level: 7 }, [newSpecies('sprout', 'Sprout', ['grass'])])
    let state = newField('town', { x: 5, y: 6 }, 'up', undefined, undefined, party)

    assert.equal(state.approach, null, 'off the line at first')

    state = advanceField(state, up, 16, watched)
    assert.ok(state.player.step !== null, 'one tap starts the step onto the line')

    for (let t = 0; t < WALK_MS_PER_CELL - 16; t += 16) {
        state = advanceField(state, none, 16, watched)
        assert.equal(state.approach, null, 'not spotted while still stepping in')
    }

    state = advanceField(state, none, 16, watched)
    assert.deepEqual(state.player.cell, { x: 5, y: 5 })
    assert.equal(state.player.step, null)

    state = advanceField(state, none, 16, watched)
    assert.deepEqual(state.approach, { eventId: 'ace' }, 'spotted on the first frame standing on the line')

    const frozen = advanceField(state, right, 16, watched)

    assert.equal(frozen.player.step, null, 'the player cannot move while a trainer walks up')
    assert.equal(frozen.player.facing, 'up', 'nor turn')

    for (let t = 0; t < WALK_MS_PER_CELL * 2 + 64; t += 16) {
        state = advanceField(state, right, 16, watched)
    }

    assert.deepEqual(npcMover(state, trainer).cell, { x: 4, y: 5 }, 'stopped beside the player')
    assert.equal(state.player.facing, 'left', 'the player turns to meet them')
    assert.deepEqual(state.battle, { party, speciesId: 'sprout', level: 5, trainer: { eventId: 'ace', name: 'Ace', defeatedFlagId: 'beat-ace' } })

    const after = afterBattle(state, { outcome: 'won', party }, 'Sprout')

    assert.equal(after.battle, undefined)
    assert.equal(after.approach, null)
    assert.equal(hasFlag(after.memory, 'beat-ace'), true, 'a win sets the defeated flag')
    assert.equal(after.message?.pages[0]?.text, 'Ace wants to battle!')

    let settled = after
    for (let t = 0; t < 2000; t += 16) {
        settled = advanceField(settled, none, 16, watched)
    }
    assert.equal(settled.approach, null, 'once beaten, the trainer never challenges again')
    assert.equal(settled.battle, undefined)
})

test('a wall between them blocks the sight line', () => {
    const walled: FieldWorld = { ...watched, canEnter: () => (from, to) => !(to.x === 4 && to.y === 5) && insideMap(town)(from, to) }
    let state = newField('town', { x: 5, y: 5 }, 'up')

    state = advanceField(state, none, 16, walled)
    assert.equal(state.approach, null, 'the wall at (4, 5) hides the player')

    state = newField('town', { x: 3, y: 5 }, 'up')
    state = advanceField(state, none, 16, walled)
    assert.deepEqual(state.approach, { eventId: 'ace' }, 'in front of the wall they are seen')
})

test('a trainer already beaten, or still thinking of the fight lost, obeys the flag alone', () => {
    const beaten = newField('town', { x: 5, y: 5 }, 'up', setFlag(newMemory(), 'beat-ace'))

    assert.equal(advanceField(beaten, none, 16, watched).approach, null, 'the flag suppresses the challenge')

    const lost = afterBattle({ ...newField('town', { x: 5, y: 5 }), battle: { party: [], speciesId: 'sprout', level: 5, trainer: { eventId: 'ace', name: 'Ace', defeatedFlagId: 'beat-ace' } } }, { outcome: 'lost', party: [] }, 'Sprout')

    assert.equal(hasFlag(lost.memory, 'beat-ace'), false, 'a loss leaves the flag clear, so they can be fought again')
    assert.equal(lost.challengedBy, 'ace')

    let standing = lost
    standing = advanceField(standing, { ...none, interact: true }, 16, watched)
    standing = advanceField(standing, { ...none, interact: true }, 16, watched)
    assert.equal(standing.message, null, 'both pages read')
    for (let t = 0; t < 1000; t += 16) {
        standing = advanceField(standing, none, 16, watched)
    }
    assert.equal(standing.approach, null, 'but not on the spot: the player must walk away first')

    let away = standing
    for (let t = 0; t < WALK_MS_PER_CELL + 32; t += 16) {
        away = advanceField(away, down, 16, watched)
    }
    assert.equal(away.challengedBy, null, 'a finished step forgets the last challenger')
})

test('a dialog page that names a flag sets it when shown, and a gate reading that flag opens (T-050)', () => {
    const woodsman = newNpcEvent('woodsman', { x: 5, y: 4 }, 'Woodsman', null, 'down', 'cut')
    const gated: FieldWorld = {
        ...world,
        eventsOf: () => [woodsman],
        pagesOf: id => (id === 'cut' ? [newPage('Let me cut that tree.'), { ...newPage('There. Off you go.'), setsFlagId: 'tree-cut' }] : undefined),
        canEnter: (_mapId, memory) => (from, to) => insideMap(town)(from, to) && !(to.x === 6 && to.y === 5 && !hasFlag(memory, 'tree-cut')),
    }
    let state = newField('town', { x: 5, y: 5 }, 'right')
    const play = (input: FieldInput, ms: number) => {
        for (let t = 0; t < ms; t += 16) {
            state = advanceField(state, input, 16, gated)
        }
    }

    play(right, WALK_MS_PER_CELL + 32)
    assert.deepEqual(state.player.cell, { x: 5, y: 5 }, 'the gate is a wall while the flag is clear')
    assert.equal(state.player.step, null)

    play(up, 16)
    assert.equal(state.player.facing, 'up', 'turned toward the woodsman, who blocks the cell')
    play(none, 32)
    state = advanceField(state, { ...none, interact: true }, 16, gated)
    assert.equal(state.message?.pages[0]?.text, 'Let me cut that tree.')
    assert.equal(hasFlag(state.memory, 'tree-cut'), false, 'the first page sets nothing')

    state = advanceField(state, { ...none, interact: true }, 16, gated)
    assert.equal(hasFlag(state.memory, 'tree-cut'), true, 'the second page set the flag the frame it appeared')

    state = advanceField(state, { ...none, interact: true }, 16, gated)
    assert.equal(state.message, null)

    play(right, WALK_MS_PER_CELL + 32)
    assert.deepEqual(state.player.cell, { x: 6, y: 5 }, 'and the gate lets the player through')
})

test('the Party entry opens the party screen over the menu, the cursor moves through the party, and closing returns the player where they stood (T-055)', () => {
    const species = newSpecies('sprout', 'Sprout', ['grass'])
    const party = [...starterParty({ speciesId: 'sprout', level: 7 }, [species]), ...starterParty({ speciesId: 'sprout', level: 3 }, [species])]
    let state = newField('town', { x: 5, y: 5 }, 'left', undefined, undefined, party)

    state = advanceField(state, { ...none, menu: true }, 16, world)
    state = advanceField(state, { ...none, direction: 'down' }, 16, world) // highlight party
    state = advanceField(state, { ...none, interact: true }, 16, world)
    assert.equal(state.menuChoice, 'party')
    assert.deepEqual(state.partyScreen, { highlight: 0 })
    assert.equal(state.bagScreen, null)

    state = advanceField(state, { ...none }, 16, world)
    state = advanceField(state, { ...down, running: true }, 400, world)
    assert.equal(state.partyScreen?.highlight, 1, 'down moves the cursor')
    assert.deepEqual(state.player.cell, { x: 5, y: 5 }, 'the field is paused')
    assert.equal(state.player.step, null)

    state = advanceField(state, { ...none }, 16, world)
    state = advanceField(state, { ...down, running: true }, 16, world)
    assert.equal(state.partyScreen?.highlight, 1, 'stops at the last creature')

    const back = advanceField(state, { ...none, interact: true }, 16, world)

    assert.equal(back.partyScreen, null)
    assert.notEqual(back.menu, null, 'back on the menu')

    const field = advanceField(back, { ...none, menu: true }, 16, world)

    assert.equal(field.menu, null)
    assert.deepEqual(field.player.cell, { x: 5, y: 5 })
    assert.equal(field.player.facing, 'left', 'exactly where and how they stood')
})
