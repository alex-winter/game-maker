import { BattleData, BattleState, battleStep, Combatant, playerMoves } from '../domain/battle'
import { newPage } from '../domain/dialog'
import { TrainerChallenge } from '../domain/encounter'
import { Random } from '../domain/random'
import { DrawPort, PortSize } from './draw-port'
import { drawMessageBox, openMessage } from './message'

/**
 * The battle scene (T-053): what the player sees of a `BattleState` and
 * how their presses move it along. Pure like the field session — the host
 * feeds key edges in and draws what comes out.
 *
 * Panels: `intro` announces the opponent; `main` offers FIGHT and RUN;
 * `moves` lists the creature's moves; `log` shows the turn's lines one at a
 * time; `done` means the host should take `battleResult` and go back to the
 * field.
 */
export type BattlePanel = 'intro' | 'main' | 'moves' | 'log' | 'done'

export type BattleSceneState = {
    readonly battle: BattleState

    readonly panel: BattlePanel

    readonly highlight: number

    /** The lines of the last turn still to show, oldest first. */
    readonly lines: readonly string[]

    readonly opening: string
}

/** Key edges for one frame: pressed this frame, not held. */
export type BattleInput = {
    readonly up: boolean

    readonly down: boolean

    readonly interact: boolean

    readonly cancel: boolean
}

export const MAIN_OPTIONS = ['FIGHT', 'RUN'] as const

export function openingLine(foe: Combatant, trainer: TrainerChallenge | null): string {
    return trainer === null ? `A wild ${foe.species.name.toUpperCase()} appeared!` : `${trainer.name} sent out ${foe.species.name.toUpperCase()}!`
}

export function newBattleScene(battle: BattleState, trainer: TrainerChallenge | null): BattleSceneState {
    return { battle, panel: 'intro', highlight: 0, lines: [], opening: openingLine(battle.foe, trainer) }
}

function moveCursor(highlight: number, input: BattleInput, count: number): number {
    const delta = input.down ? 1 : input.up ? -1 : 0

    return Math.min(count - 1, Math.max(0, highlight + delta))
}

/** The turn's lines queued for showing, then wherever the outcome sends the scene once they are read. */
function showTurn(scene: BattleSceneState, battle: BattleState): BattleSceneState {
    return { ...scene, battle, panel: 'log', lines: battle.log, highlight: 0 }
}

export function advanceBattleScene(scene: BattleSceneState, input: BattleInput, data: BattleData, random: Random): BattleSceneState {
    switch (scene.panel) {
        case 'intro':
            return input.interact ? { ...scene, panel: 'main', highlight: 0 } : scene

        case 'main': {
            if (input.interact) {
                if (MAIN_OPTIONS[scene.highlight] === 'RUN') {
                    return showTurn(scene, battleStep(scene.battle, { kind: 'run' }, data, random))
                }

                const moves = playerMoves(scene.battle, data)

                // A creature with nothing to use swings anyway, so the battle never stalls.
                return moves.length === 0
                    ? showTurn(scene, battleStep(scene.battle, { kind: 'move', moveId: '' }, data, random))
                    : { ...scene, panel: 'moves', highlight: 0 }
            }

            return { ...scene, highlight: moveCursor(scene.highlight, input, MAIN_OPTIONS.length) }
        }

        case 'moves': {
            const moves = playerMoves(scene.battle, data)

            if (input.cancel) {
                return { ...scene, panel: 'main', highlight: 0 }
            }

            if (input.interact) {
                const move = moves[scene.highlight]

                return move === undefined ? scene : showTurn(scene, battleStep(scene.battle, { kind: 'move', moveId: move.id }, data, random))
            }

            return { ...scene, highlight: moveCursor(scene.highlight, input, Math.max(1, moves.length)) }
        }

        case 'log': {
            if (!input.interact) {
                return scene
            }

            const rest = scene.lines.slice(1)

            if (rest.length > 0) {
                return { ...scene, lines: rest }
            }

            return scene.battle.outcome === null ? { ...scene, panel: 'main', lines: [], highlight: 0 } : { ...scene, panel: 'done', lines: [] }
        }

        case 'done':
            return scene
    }
}

export function isBattleOver(scene: BattleSceneState): boolean {
    return scene.panel === 'done'
}

/** What the box says this frame: the opening, a prompt, or the line being read. */
export function sceneText(scene: BattleSceneState): string {
    switch (scene.panel) {
        case 'intro':
            return scene.opening
        case 'main':
        case 'moves':
            return `What will ${scene.battle.player.species.name.toUpperCase()} do?`
        case 'log':
            return scene.lines[0] ?? ''
        case 'done':
            return ''
    }
}

const BACKGROUND = '#d8e8c8'

const GROUND = '#b8d0a0'

const PANEL = '#f8f4e8'

const INK = '#30304a'

const HP_GREEN = '#48b848'

const HP_YELLOW = '#e0c030'

const HP_RED = '#d04040'

const FONT_SIZE = 10

/** A stand-in colour per species until species have pictures: a stable hue from the name. */
export function standInColor(name: string): string {
    let hash = 0

    for (const character of name) {
        hash = (hash * 31 + character.charCodeAt(0)) >>> 0
    }

    return `hsl(${hash % 360}, 55%, 55%)`
}

function hpColor(fraction: number): string {
    return fraction > 0.5 ? HP_GREEN : fraction > 0.2 ? HP_YELLOW : HP_RED
}

function drawStatus(port: DrawPort<unknown>, who: Combatant, x: number, y: number, zoom: number, showNumbers: boolean): void {
    const width = 96
    const height = showNumbers ? 34 : 24

    port.fillRect(x * zoom, y * zoom, width * zoom, height * zoom, INK)
    port.fillRect((x + 1) * zoom, (y + 1) * zoom, (width - 2) * zoom, (height - 2) * zoom, PANEL)
    port.fillText(who.species.name.toUpperCase(), (x + 4) * zoom, (y + 3) * zoom, FONT_SIZE * zoom, INK)
    port.fillText(`Lv${who.creature.level}`, (x + width - 28) * zoom, (y + 3) * zoom, FONT_SIZE * zoom, INK)

    const barX = x + 4
    const barY = y + 15
    const barWidth = width - 8
    const fraction = who.maxHp === 0 ? 0 : who.creature.hp / who.maxHp

    port.fillRect(barX * zoom, barY * zoom, barWidth * zoom, 4 * zoom, '#a0a0a8')
    port.fillRect(barX * zoom, barY * zoom, Math.round(barWidth * fraction) * zoom, 4 * zoom, hpColor(fraction))

    if (showNumbers) {
        port.fillText(`${who.creature.hp}/${who.maxHp}`, (x + 4) * zoom, (y + 21) * zoom, FONT_SIZE * zoom, INK)
    }
}

/**
 * Draws the whole scene inside the 240×160 view: the foe top-right with its
 * status top-left, the player's creature bottom-left with its status beside
 * it, and the message box along the bottom with the main or move menu
 * as its choices.
 */
export function drawBattleScene(port: DrawPort<unknown>, scene: BattleSceneState, data: BattleData, view: PortSize, zoom: number): void {
    const { battle } = scene

    port.fillRect(0, 0, view.width * zoom, view.height * zoom, BACKGROUND)
    port.fillRect(0, 96 * zoom, view.width * zoom, (view.height - 96) * zoom, GROUND)

    // Stand-ins: the foe small and far, the player's creature larger and near.
    if (battle.foe.creature.hp > 0) {
        port.fillRect(160 * zoom, 28 * zoom, 40 * zoom, 40 * zoom, standInColor(battle.foe.species.name))
    }

    if (battle.player.creature.hp > 0) {
        port.fillRect(8 * zoom, 68 * zoom, 48 * zoom, 48 * zoom, standInColor(battle.player.species.name))
    }

    // The player's status sits left of centre so the choice box, which hangs from the right edge, never covers it.
    drawStatus(port, battle.foe, 8, 8, zoom, false)
    drawStatus(port, battle.player, 60, 80, zoom, true)

    const choices = scene.panel === 'main'
        ? MAIN_OPTIONS.map(label => ({ label, nextDialogId: null }))
        : scene.panel === 'moves'
            ? playerMoves(battle, data).map(move => ({ label: move.name.toUpperCase(), nextDialogId: null }))
            : []
    const message = { ...openMessage([newPage(sceneText(scene), choices)]), highlight: scene.highlight }

    drawMessageBox(port, message, view, zoom)
}
