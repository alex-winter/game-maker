import { Connections, crossEdge } from '../domain/connection'
import { Cell } from '../domain/coordinates'
import { Id } from '../domain/id'
import { GridSize, isInside } from '../domain/map'
import { CanEnter, Direction, MovementInput, newPlayer, Player, stepPlayer } from '../domain/movement'
import { faceToward, Interaction, resolveInteraction } from '../domain/interact'
import { ItemEvent, MapEvent, NpcEvent, npcsOn, stepFinished, warpTaken } from '../domain/warp'
import { advanceFade, Fade, startFade } from './fade'
import { DialogPage, newPage } from '../domain/dialog'
import { Memory, newMemory } from '../domain/flags'
import { Bag, isTaken, newBag, pickUp } from '../domain/item'
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
}

export function newField(mapId: Id, spawn: Cell, facing: Direction = 'down', memory: Memory = newMemory(), bag: Bag = newBag()): FieldState {
    return { mapId, player: newPlayer(spawn, facing), fade: null, pending: undefined, interaction: undefined, message: null, lastDirection: null, memory, bag, menu: null, menuChoice: undefined, bagScreen: null, talkingTo: null }
}

/** What a save keeps of the session (T-041): the standing cell, never a half-finished step. */
export function snapshotField(state: FieldState): SavedSession {
    const cell = state.player.step === null ? state.player.cell : state.player.step.to

    return { mapId: state.mapId, cell, facing: state.player.facing, memory: state.memory, bag: state.bag }
}

/** A session resumed from a save: standing where it was saved, with its memory and bag. */
export function restoreField(session: SavedSession): FieldState {
    return newField(session.mapId, session.cell, session.facing, session.memory, session.bag)
}

/** After the host has written the save: the menu closes and the box says so. */
export function afterSave(state: FieldState): FieldState {
    return { ...state, menu: null, menuChoice: undefined, message: openMessage([newPage('Saved the game.')]) }
}

/** The way an NPC faces this frame: toward the player while they talk, else their own. */
export function npcFacing(state: FieldState, npc: NpcEvent): Direction {
    return state.talkingTo !== null && state.talkingTo.eventId === npc.id ? state.talkingTo.facing : npc.facing
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
        return { ...state, interaction: undefined, message, lastDirection: input.direction, menuChoice: undefined, talkingTo: message === null ? null : state.talkingTo }
    }

    if (state.bagScreen !== null) {
        const count = state.bag.length
        const moved = pressed === 'up' ? moveBagCursor(state.bagScreen, -1, count) : pressed === 'down' ? moveBagCursor(state.bagScreen, 1, count) : state.bagScreen

        // The menu key steps back to the menu; there is nothing to do with an item yet, so the interact key does too.
        return { ...state, interaction: undefined, menuChoice: undefined, bagScreen: input.menu || input.interact ? null : moved, lastDirection: input.direction }
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
        }
    }

    if (input.menu && state.player.step === null) {
        return { ...state, interaction: undefined, menu: openMenu(), menuChoice: undefined, lastDirection: input.direction }
    }

    const size = world.sizeOf(state.mapId)

    if (size === undefined) {
        return { ...state, interaction: undefined, menuChoice: undefined }
    }

    // The interact key looks, it does not move: a standing player stays put this frame.
    if (input.interact && state.player.step === null) {
        const events = visibleEvents(world.eventsOf(state.mapId), state.memory)
        const interaction = resolveInteraction(state.player, events)

        if (interaction?.kind === 'sign') {
            const message = openMessage(world.pagesOf(interaction.dialogId) ?? missingDialogPages(interaction.dialogId))

            return { ...state, interaction, message, lastDirection: input.direction, menuChoice: undefined }
        }

        if (interaction?.kind === 'npc') {
            const npc = events.find((candidate): candidate is NpcEvent => candidate.kind === 'npc' && candidate.id === interaction.eventId)

            if (npc !== undefined) {
                const pages = interaction.dialogId === null ? silentPages(npc.name) : world.pagesOf(interaction.dialogId) ?? missingDialogPages(interaction.dialogId)
                const facing = faceToward(npc.cell, state.player.cell) ?? npc.facing

                return { ...state, interaction, message: openMessage(pages), talkingTo: { eventId: npc.id, facing }, lastDirection: input.direction, menuChoice: undefined }
            }
        }

        if (interaction?.kind === 'item') {
            const event = events.find((candidate): candidate is ItemEvent => candidate.kind === 'item' && candidate.id === interaction.itemEventId)

            if (event !== undefined) {
                const taken = pickUp(state.bag, state.memory, event)
                const message = openMessage(foundMessage(world.itemOf(event.itemId)?.name))

                return { ...state, interaction, message, bag: taken.bag, memory: taken.memory, lastDirection: input.direction, menuChoice: undefined }
            }
        }

        return { ...state, interaction, message: null, lastDirection: input.direction, menuChoice: undefined }
    }

    const player = stepPlayer(state.player, input, deltaMs, seamAwareRule(state.mapId, size, state.memory, world))
    const transition = transitionReached(state.player, player, state.mapId, size, world)

    if (transition !== undefined) {
        // Freeze where the step landed; a held key must not walk on while the screen fades.
        return { ...state, player: { ...player, step: null }, fade: startFade(), pending: transition, interaction: undefined, lastDirection: input.direction, menuChoice: undefined }
    }

    return { ...state, player, interaction: undefined, lastDirection: input.direction, menuChoice: undefined }
}

/** Inside the map the collision rule decides and an item still lying there or a person standing there blocks; beyond an edge a seam may let the step through onto open ground. */
function seamAwareRule(mapId: Id, size: GridSize, memory: Memory, world: FieldWorld): CanEnter {
    const inside = world.canEnter(mapId)
    const events = world.eventsOf(mapId)
    const occupied: readonly Cell[] = [...itemsOnMap(events, memory), ...npcsOn(events)].map(event => event.cell)

    return (from, to) => {
        if (isInside(size, to)) {
            return inside(from, to) && !occupied.some(cell => cell.x === to.x && cell.y === to.y)
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
