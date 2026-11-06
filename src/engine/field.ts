import { Connections, crossEdge } from '../domain/connection'
import { Cell } from '../domain/coordinates'
import { Id } from '../domain/id'
import { GridSize, isInside } from '../domain/map'
import { CanEnter, Direction, MovementInput, newPlayer, Player, restingCell, stepPlayer } from '../domain/movement'
import { finishStep, newNpcMotion, NpcMotion, Random, tickNpcMotion } from '../domain/npc-behavior'
import { faceToward, Interaction, resolveInteraction } from '../domain/interact'
import { ItemEvent, MapEvent, NpcEvent, npcsOn, stepFinished, warpTaken } from '../domain/warp'
import { advanceFade, Fade, startFade } from './fade'
import { DialogPage, newPage } from '../domain/dialog'
import { addToVariable, Memory, newMemory } from '../domain/flags'
import { Bag, isTaken, newBag, pickUp } from '../domain/item'
import { Party } from '../domain/creature'
import { BattleRequest, BattleResult, EncounterTable, rollEncounter, wildAppearedText } from '../domain/encounter'
import { advanceMessage, MessageState, missingDialogPages, moveHighlight, openMessage } from './message'
import { MenuEntry, MenuState, moveMenu, openMenu, selectedEntry } from './menu'
import { SavedSession } from '../domain/save'
import { BagScreenState, moveBagCursor, openBagScreen } from './bag-screen'

/** Where the player will be once the screen is black. */
export type Transition = {
    readonly mapId: Id

    readonly cell: Cell

    readonly facing: Direction
}

/** The field session: which map, where the player is, and any fade in progress. */
export type FieldState = {
    readonly mapId: Id

    readonly player: Player

    readonly fade: Fade | null

    readonly pending: Transition | undefined

    /** What the interact key found this frame, for the host to act on. Cleared the next frame. */
    readonly interaction: Interaction | undefined

    /** The message box, while one is open. The player stands still and the interact key pages it. */
    readonly message: MessageState | null

    /** Last frame's held direction, so menus react to a press rather than to holding. */
    readonly lastDirection: Direction | null

    /** Story flags and variables for this session (T-040). Items and gates read and write it. */
    readonly memory: Memory

    /** What the player carries (T-038). */
    readonly bag: Bag

    /** The start menu, while it is open (T-046). The player stands still. */
    readonly menu: MenuState | null

    /** The entry the player just confirmed in the menu, for the host to open. Cleared the next frame. */
    readonly menuChoice: MenuEntry | undefined

    /** The bag screen, while it is open over the menu (T-039). */
    readonly bagScreen: BagScreenState | null

    /** The person being talked to and the way they turned to face the player (T-043), while the message is open. */
    readonly talkingTo: { readonly eventId: Id; readonly facing: Direction } | null

    /** Where each person on this map is right now (T-044), seeded from the events the first frame they are seen. */
    readonly people: readonly NpcMotion[]

    /** The creatures the player carries (T-047). Battles change it through `afterBattle`. */
    readonly party: Party

    /** A wild encounter the last step started (T-048), for the host to run through its `BattleRunner`. Cleared by `afterBattle`. */
    readonly battle: BattleRequest | undefined
}

/** Movement plus whether the interact and menu keys were pressed this frame (edges, not levels). */
export type FieldInput = MovementInput & {
    readonly interact: boolean

    /** Start: opens the menu, or closes it while it is open. */
    readonly menu: boolean
}

/** What the session asks about the world. Hosts answer from the project; tests from fixtures. */
export type FieldWorld = {
    sizeOf(mapId: Id): GridSize | undefined

    /** The within-map rule for `mapId`: collision, elevation, ledges. */
    canEnter(mapId: Id): CanEnter

    /** Whether a landing cell on another map can be stood on. */
    isSolidAt(mapId: Id, cell: Cell): boolean

    connectionsOf(mapId: Id): Connections

    eventsOf(mapId: Id): readonly MapEvent[]

    /** The pages of a dialog, or undefined when no dialog has that id. */
    pagesOf(dialogId: Id): readonly DialogPage[] | undefined

    /** The item's name and description, or undefined when the catalog has no such item. */
    itemOf(itemId: Id): { readonly name: string; readonly description: string } | undefined

    /** Numbers in [0, 1) for people who look around or wander, and for the grass. */
    random: Random

    /** Whether a cell is tall grass. */
    isGrassAt(mapId: Id, cell: Cell): boolean

    /** The map's encounter table, or undefined when the map is gone. */
    encountersOf(mapId: Id): EncounterTable | undefined

    speciesName(speciesId: Id): string | undefined
}

export function newField(mapId: Id, spawn: Cell, facing: Direction = 'down', memory: Memory = newMemory(), bag: Bag = newBag(), party: Party = []): FieldState {
    return { mapId, player: newPlayer(spawn, facing), fade: null, pending: undefined, interaction: undefined, message: null, lastDirection: null, memory, bag, menu: null, menuChoice: undefined, bagScreen: null, talkingTo: null, people: [], party, battle: undefined }
}

/** What a save keeps of the session (T-041): the standing cell, never a half-finished step. */
export function snapshotField(state: FieldState): SavedSession {
    return { mapId: state.mapId, cell: restingCell(state.player), facing: state.player.facing, memory: state.memory, bag: state.bag, party: state.party }
}

/** A session resumed from a save: standing where it was saved, with its memory, bag, and party. */
export function restoreField(session: SavedSession): FieldState {
    return newField(session.mapId, session.cell, session.facing, session.memory, session.bag, session.party)
}

/** After the host has written the save: the menu closes and the box says so. */
export function afterSave(state: FieldState): FieldState {
    return { ...state, menu: null, menuChoice: undefined, message: openMessage([newPage('Saved the game.')]) }
}

/** What the placeholder battle says for each way out. T-056 replaces the placeholder, not this message's place in the flow. */
export function battleOutcomeText(outcome: BattleResult['outcome']): string {
    switch (outcome) {
        case 'won':
            return 'You won! (The battle scene arrives in phase 9.)'
        case 'lost':
            return 'You lost...'
        case 'fled':
            return 'With nobody able to fight, you ran away.'
    }
}

/**
 * After the host has run the battle: the request is consumed, the party is
 * whatever the battle left, a win is counted in memory, and the box tells
 * the story — who appeared, then how it ended.
 */
export function afterBattle(state: FieldState, result: BattleResult, speciesName: string | undefined): FieldState {
    return {
        ...state,
        battle: undefined,
        party: result.party,
        memory: result.outcome === 'won' ? addToVariable(state.memory, 'battles-won', 1) : state.memory,
        message: openMessage([newPage(wildAppearedText(speciesName)), newPage(battleOutcomeText(result.outcome))]),
    }
}

/** Where a person is and how they face this frame, for the host to draw: their motion, turned toward the player while they talk. */
export function npcMover(state: FieldState, npc: NpcEvent): Player {
    const mover = state.people.find(motion => motion.eventId === npc.id)?.mover ?? newPlayer(npc.cell, npc.facing)

    return state.talkingTo !== null && state.talkingTo.eventId === npc.id ? { ...mover, facing: state.talkingTo.facing } : mover
}

/** The map's people as the session knows them: each where their motion has taken them, so the interact key finds a wanderer where they stand. */
export function liveEvents(state: FieldState, events: readonly MapEvent[]): MapEvent[] {
    return events.map(event => {
        if (event.kind !== 'npc') {
            return event
        }

        const motion = state.people.find(candidate => candidate.eventId === event.id)

        return motion === undefined ? event : { ...event, cell: restingCell(motion.mover) }
    })
}

/** Keeps a motion for every person on the map and only those: a newly seen person starts where they were placed. */
function syncPeople(people: readonly NpcMotion[], npcs: readonly NpcEvent[]): readonly NpcMotion[] {
    return npcs.map(npc => people.find(motion => motion.eventId === npc.id) ?? newNpcMotion(npc))
}

/** While the field is paused people finish the step they are on and otherwise wait. */
function pausePeople(people: readonly NpcMotion[], deltaMs: number): readonly NpcMotion[] {
    return people.map(motion => finishStep(motion, deltaMs))
}

/** Every cell a mover occupies: where they stand and, mid-step, where they will land. */
function footprint(mover: Player): Cell[] {
    return mover.step === null ? [mover.cell] : [mover.step.from, mover.step.to]
}

function occupies(cells: readonly Cell[], cell: Cell): boolean {
    return cells.some(candidate => candidate.x === cell.x && candidate.y === cell.y)
}

/** What a person with no dialog says, so the author sees who to write for. */
export function silentPages(name: string): DialogPage[] {
    return [newPage(`(${name} has nothing to say yet.)`)]
}

/** The map's events as the session sees them now: an item already taken is not there. */
export function visibleEvents(events: readonly MapEvent[], memory: Memory): MapEvent[] {
    return events.filter(event => event.kind !== 'item' || !isTaken(event, memory))
}

/** The items still lying on the map, for the host to draw. */
export function itemsOnMap(events: readonly MapEvent[], memory: Memory): ItemEvent[] {
    return events.filter((event): event is ItemEvent => event.kind === 'item' && !isTaken(event, memory))
}

/** What the box says when the player picks something up. */
export function foundMessage(itemName: string | undefined): DialogPage[] {
    return [newPage(itemName === undefined ? 'You found something, but the project has no such item.' : `You found a ${itemName.toUpperCase()}!`)]
}

/** True while a fade runs: the player does not move and input is ignored. */
export function isTransitioning(state: FieldState): boolean {
    return state.fade !== null
}

/**
 * One frame of the field. During a fade the player stands still and input
 * is dropped; when the fade-out completes the pending transition lands the
 * player on the new map. While a message is open the player stands, a
 * fresh up or down press moves the choice cursor, and the interact key
 * confirms — the next page, the chosen branch, or closing. The menu key
 * opens the start menu, which likewise holds the player; up and down move
 * its cursor, the interact key confirms an entry into `menuChoice` (Close
 * and the menu key close it; Bag opens the bag screen over it, which the
 * menu key steps back out of). Otherwise the player steps, and a warp or a
 * seam reached by that step starts a fade with the destination pending.
 */
export function advanceField(state: FieldState, input: FieldInput, deltaMs: number, world: FieldWorld): FieldState {
    if (state.fade !== null) {
        const { fade, swap } = advanceFade(state.fade, deltaMs)

        if (swap && state.pending !== undefined) {
            return { ...state, mapId: state.pending.mapId, player: newPlayer(state.pending.cell, state.pending.facing), fade, pending: undefined, interaction: undefined, menuChoice: undefined }
        }

        return { ...state, fade, interaction: undefined, menuChoice: undefined }
    }

    const pressed = input.direction !== null && input.direction !== state.lastDirection ? input.direction : null

    if (state.message !== null) {
        const moved = pressed === 'up' ? moveHighlight(state.message, -1) : pressed === 'down' ? moveHighlight(state.message, 1) : state.message
        const message = input.interact ? advanceMessage(moved, id => world.pagesOf(id)) : moved

        // Once the conversation ends the person turns back the way they were.
        return { ...state, interaction: undefined, message, lastDirection: input.direction, menuChoice: undefined, talkingTo: message === null ? null : state.talkingTo, people: pausePeople(state.people, deltaMs) }
    }

    if (state.bagScreen !== null) {
        const count = state.bag.length
        const moved = pressed === 'up' ? moveBagCursor(state.bagScreen, -1, count) : pressed === 'down' ? moveBagCursor(state.bagScreen, 1, count) : state.bagScreen

        // The menu key steps back to the menu; there is nothing to do with an item yet, so the interact key does too.
        return { ...state, interaction: undefined, menuChoice: undefined, bagScreen: input.menu || input.interact ? null : moved, lastDirection: input.direction, people: pausePeople(state.people, deltaMs) }
    }

    if (state.menu !== null) {
        const moved = pressed === 'up' ? moveMenu(state.menu, -1) : pressed === 'down' ? moveMenu(state.menu, 1) : state.menu
        const choice = input.interact ? selectedEntry(moved) : undefined
        const closes = input.menu || choice === 'close'

        return {
            ...state,
            interaction: undefined,
            menu: closes ? null : moved,
            menuChoice: choice,
            bagScreen: choice === 'bag' ? openBagScreen() : null,
            lastDirection: input.direction,
            people: pausePeople(state.people, deltaMs),
        }
    }

    if (input.menu && state.player.step === null) {
        return { ...state, interaction: undefined, menu: openMenu(), menuChoice: undefined, lastDirection: input.direction }
    }

    const size = world.sizeOf(state.mapId)

    if (size === undefined) {
        return { ...state, interaction: undefined, menuChoice: undefined }
    }

    const mapEvents = world.eventsOf(state.mapId)
    const synced: FieldState = { ...state, people: syncPeople(state.people, npcsOn(mapEvents)) }

    // The interact key looks, it does not move: a standing player stays put this frame.
    if (input.interact && state.player.step === null) {
        const events = visibleEvents(liveEvents(synced, mapEvents), state.memory)
        const interaction = resolveInteraction(state.player, events)

        if (interaction?.kind === 'sign') {
            const message = openMessage(world.pagesOf(interaction.dialogId) ?? missingDialogPages(interaction.dialogId))

            return { ...synced, interaction, message, lastDirection: input.direction, menuChoice: undefined }
        }

        if (interaction?.kind === 'npc') {
            const npc = events.find((candidate): candidate is NpcEvent => candidate.kind === 'npc' && candidate.id === interaction.eventId)

            if (npc !== undefined) {
                const pages = interaction.dialogId === null ? silentPages(npc.name) : world.pagesOf(interaction.dialogId) ?? missingDialogPages(interaction.dialogId)
                const facing = faceToward(npc.cell, state.player.cell) ?? npc.facing

                return { ...synced, interaction, message: openMessage(pages), talkingTo: { eventId: npc.id, facing }, lastDirection: input.direction, menuChoice: undefined }
            }
        }

        if (interaction?.kind === 'item') {
            const event = events.find((candidate): candidate is ItemEvent => candidate.kind === 'item' && candidate.id === interaction.itemEventId)

            if (event !== undefined) {
                const taken = pickUp(state.bag, state.memory, event)
                const message = openMessage(foundMessage(world.itemOf(event.itemId)?.name))

                return { ...synced, interaction, message, bag: taken.bag, memory: taken.memory, lastDirection: input.direction, menuChoice: undefined }
            }
        }

        return { ...synced, interaction, message: null, lastDirection: input.direction, menuChoice: undefined }
    }

    const people = movePeople(synced, mapEvents, size, deltaMs, world)
    const player = stepPlayer(state.player, input, deltaMs, seamAwareRule(state.mapId, size, state.memory, people, world))
    const transition = transitionReached(state.player, player, state.mapId, size, world)

    if (transition !== undefined) {
        // Freeze where the step landed; a held key must not walk on while the screen fades. The next map's people are met on arrival.
        return { ...state, player: { ...player, step: null }, fade: startFade(), pending: transition, interaction: undefined, lastDirection: input.direction, menuChoice: undefined, people: [] }
    }

    const battle = grassRoll(state, player, world)

    if (battle !== undefined) {
        // Stop where the grass rustled; the host runs the battle before the next frame.
        return { ...state, player: { ...player, step: null }, battle, interaction: undefined, lastDirection: input.direction, menuChoice: undefined, people }
    }

    return { ...state, player, interaction: undefined, lastDirection: input.direction, menuChoice: undefined, people }
}

/** A step that just finished in tall grass rolls on the map's table. A step that did not finish, or finished elsewhere, rolls nothing. */
function grassRoll(before: FieldState, after: Player, world: FieldWorld): BattleRequest | undefined {
    if (!stepFinished(before.player, after) || !world.isGrassAt(before.mapId, after.cell)) {
        return undefined
    }

    const table = world.encountersOf(before.mapId)

    return table === undefined ? undefined : rollEncounter(table, before.party, world.random) ?? undefined
}

/** One frame of every person's behavior. Nobody steps onto an item, another person's cells, or the player's; the map edge is a wall to them. */
function movePeople(state: FieldState, events: readonly MapEvent[], size: GridSize, deltaMs: number, world: FieldWorld): readonly NpcMotion[] {
    const inside = world.canEnter(state.mapId)
    const items = itemsOnMap(events, state.memory).map(item => item.cell)
    const npcs = npcsOn(events)

    return state.people.map(motion => {
        const behavior = npcs.find(npc => npc.id === motion.eventId)?.behavior ?? 'still'
        const others = state.people.filter(other => other.eventId !== motion.eventId).flatMap(other => footprint(other.mover))
        const taken = [...items, ...others, ...footprint(state.player)]
        const canEnter: CanEnter = (from, to) => isInside(size, to) && inside(from, to) && !occupies(taken, to)

        return tickNpcMotion(motion, behavior, deltaMs, canEnter, world.random)
    })
}

/** Inside the map the collision rule decides and an item still lying there or a person standing (or stepping) there blocks; beyond an edge a seam may let the step through onto open ground. */
function seamAwareRule(mapId: Id, size: GridSize, memory: Memory, people: readonly NpcMotion[], world: FieldWorld): CanEnter {
    const inside = world.canEnter(mapId)
    const events = world.eventsOf(mapId)
    const occupied: readonly Cell[] = [...itemsOnMap(events, memory).map(event => event.cell), ...people.flatMap(motion => footprint(motion.mover))]

    return (from, to) => {
        if (isInside(size, to)) {
            return inside(from, to) && !occupies(occupied, to)
        }

        const crossing = crossEdge(size, world.connectionsOf(mapId), to, id => world.sizeOf(id))

        return crossing !== undefined && !world.isSolidAt(crossing.mapId, crossing.cell)
    }
}

/** A warp the step just finished on, or the seam it just stepped across. */
function transitionReached(before: Player, after: Player, mapId: Id, size: GridSize, world: FieldWorld): Transition | undefined {
    const warp = warpTaken(before, after, world.eventsOf(mapId))

    if (warp !== undefined && world.sizeOf(warp.toMapId) !== undefined) {
        return { mapId: warp.toMapId, cell: warp.toCell, facing: warp.facing }
    }

    if (stepFinished(before, after) && !isInside(size, after.cell)) {
        const crossing = crossEdge(size, world.connectionsOf(mapId), after.cell, id => world.sizeOf(id))

        if (crossing !== undefined) {
            return { mapId: crossing.mapId, cell: crossing.cell, facing: after.facing }
        }
    }

    return undefined
}
