import test from 'node:test'
import assert from 'node:assert/strict'
import { advanceBattleScene, BattleInput, drawBattleScene, isBattleOver, newBattleScene, sceneText } from './battle-scene'
import { BattleData, battleResult, newBattle } from '../domain/battle'
import { newCreature, newMove, newSpecies } from '../domain/creature'
import { DrawPort } from './draw-port'

const flat = { hp: 50, attack: 50, defense: 50, specialAttack: 50, specialDefense: 50, speed: 50 }
const tackle = newMove('tackle', 'Tackle', 40, 100, 'normal')
const blast = newMove('blast', 'Blast', 400, 100, 'normal')
const sprout = newSpecies('sprout', 'Sprout', ['grass'], flat, [{ level: 1, moveId: 'tackle' }, { level: 1, moveId: 'blast' }])
const pebble = newSpecies('pebble', 'Pebble', ['rock'], flat, [{ level: 1, moveId: 'tackle' }])
const data: BattleData = { moves: [tackle, blast], typeChart: {} }
const speciesOf = (id: string) => [sprout, pebble].find(species => species.id === id)
const none: BattleInput = { up: false, down: false, interact: false, cancel: false }
const press = (key: keyof BattleInput): BattleInput => ({ ...none, [key]: true })

function opened() {
    const battle = newBattle({ party: [newCreature(sprout, 10)], speciesId: 'pebble', level: 10, trainer: null }, speciesOf)

    assert.ok(battle !== undefined)

    return newBattleScene(battle, null)
}

test('the scene announces the foe, offers FIGHT and RUN, lists moves, reads the turn line by line, and ends on an outcome', () => {
    let scene = opened()

    assert.equal(scene.panel, 'intro')
    assert.equal(sceneText(scene), 'A wild PEBBLE appeared!')
    assert.equal(advanceBattleScene(scene, none, data, () => 0), scene, 'nothing happens without a press')

    scene = advanceBattleScene(scene, press('interact'), data, () => 0)
    assert.equal(scene.panel, 'main')
    assert.equal(sceneText(scene), 'What will SPROUT do?')

    scene = advanceBattleScene(scene, press('interact'), data, () => 0)
    assert.equal(scene.panel, 'moves', 'FIGHT opens the move list')

    scene = advanceBattleScene(scene, press('down'), data, () => 0)
    assert.equal(scene.highlight, 1, 'down picks Blast')
    scene = advanceBattleScene(scene, press('down'), data, () => 0)
    assert.equal(scene.highlight, 1, 'stops at the last move')

    scene = advanceBattleScene(scene, press('cancel'), data, () => 0)
    assert.equal(scene.panel, 'main', 'cancel steps back')
    scene = advanceBattleScene(scene, press('interact'), data, () => 0)
    scene = advanceBattleScene(scene, press('down'), data, () => 0)
    scene = advanceBattleScene(scene, press('interact'), data, () => 0)
    assert.equal(scene.panel, 'log')
    assert.equal(sceneText(scene), 'SPROUT used BLAST!')
    assert.equal(scene.battle.outcome, 'won', 'Blast, 50 × 0.85 = 42, faints a 35 HP Pebble')

    scene = advanceBattleScene(scene, press('interact'), data, () => 0)
    assert.equal(sceneText(scene), 'Wild PEBBLE fainted!')
    assert.equal(isBattleOver(scene), false, 'the last line is still being read')

    scene = advanceBattleScene(scene, press('interact'), data, () => 0)
    assert.equal(isBattleOver(scene), true)
    assert.equal(battleResult(scene.battle).outcome, 'won')
})

test('a turn nobody loses returns to the main menu; RUN leaves a wild battle', () => {
    let scene = opened()

    scene = advanceBattleScene(scene, press('interact'), data, () => 0)
    scene = advanceBattleScene(scene, press('interact'), data, () => 0)
    scene = advanceBattleScene(scene, press('interact'), data, () => 0)
    assert.equal(scene.panel, 'log')
    assert.equal(scene.battle.outcome, null, 'Tackle for 5 leaves both standing')

    for (let i = 0; i < 2; i++) {
        scene = advanceBattleScene(scene, press('interact'), data, () => 0)
    }
    assert.equal(scene.panel, 'main', 'two lines read, back to the menu')
    assert.equal(scene.battle.foe.creature.hp, 30)

    scene = advanceBattleScene(scene, press('down'), data, () => 0)
    scene = advanceBattleScene(scene, press('interact'), data, () => 0)
    assert.equal(sceneText(scene), 'Got away safely!')
    scene = advanceBattleScene(scene, press('interact'), data, () => 0)
    assert.equal(isBattleOver(scene), true)
    assert.equal(battleResult(scene.battle).outcome, 'fled')
})

test('drawing the scene paints both status panels, the stand-ins, and the box with the menu as choices', () => {
    const texts: string[] = []
    const rects: number[] = []
    const port: DrawPort<unknown> = {
        width: 480,
        height: 320,
        clear: () => undefined,
        fillRect: (x, y, w, h) => rects.push(w * h),
        fillText: text => texts.push(text),
        drawImage: () => undefined,
    }
    const scene = advanceBattleScene(opened(), press('interact'), data, () => 0)

    drawBattleScene(port, scene, data, { width: 240, height: 160 }, 2)

    assert.ok(texts.includes('PEBBLE') && texts.includes('SPROUT'), 'both names')
    assert.ok(texts.includes('35/35'), 'the player sees numbers')
    assert.ok(texts.includes('FIGHT') && texts.includes('RUN'), 'the main menu')
    assert.ok(texts.includes('What will SPROUT do?'))
    assert.ok(rects.includes(40 * 2 * 40 * 2) && rects.includes(48 * 2 * 48 * 2), 'both stand-ins')
})
