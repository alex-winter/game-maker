import { Connections, crossEdge } from '../domain/connection'
import { Cell } from '../domain/coordinates'
import { Id } from '../domain/id'
import { GridSize, isInside } from '../domain/map'
import { CanEnter, Direction, MovementInput, newPlayer, Player, stepPlayer } from '../domain/movement'
import { Interaction, resolveInteraction } from '../domain/interact'
import { MapEvent, stepFinished, warpTaken } from '../domain/warp'
import { advanceFade, Fade, startFade } from './fade'
import { advanceMessage, MessageState, openMessage } from './message'

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
}

/** Movement plus whether the interact key was pressed this frame (edge, not level). */
export type FieldInput = MovementInput & {
    readonly interact: boolean
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
    pagesOf(dialogId: Id): readonly string[] | undefined
}

export function newField(mapId: Id, spawn: Cell, facing: Direction = 'down'): FieldState {
    return { mapId, player: newPlayer(spawn, facing), fade: null, pending: undefined, interaction: undefined, message: null }
}

/** What a sign with no dialog behind it says, so the author sees which id to fix. */
export function missingDialogPages(dialogId: Id): string[] {
    return [`(No dialog "${dialogId}" exists yet.)`]
}

/** True while a fade runs: the player does not move and input is ignored. */
export function isTransitioning(state: FieldState): boolean {
    return state.fade !== null
}

/**
 * One frame of the field. During a fade the player stands still and input
 * is dropped; when the fade-out completes the pending transition lands the
 * player on the new map. While a message is open the player stands and
 * the interact key pages it. Otherwise the player steps, and a warp or a
 * seam reached by that step starts a fade with the destination pending.
 */
export function advanceField(state: FieldState, input: FieldInput, deltaMs: number, world: FieldWorld): FieldState {
    if (state.fade !== null) {
        const { fade, swap } = advanceFade(state.fade, deltaMs)

        if (swap && state.pending !== undefined) {
            return { ...state, mapId: state.pending.mapId, player: newPlayer(state.pending.cell, state.pending.facing), fade, pending: undefined, interaction: undefined }
        }

        return { ...state, fade, interaction: undefined }
    }

    if (state.message !== null) {
        return { ...state, interaction: undefined, message: input.interact ? advanceMessage(state.message) : state.message }
    }

    const size = world.sizeOf(state.mapId)

    if (size === undefined) {
        return { ...state, interaction: undefined }
    }

    // The interact key looks, it does not move: a standing player stays put this frame.
    if (input.interact && state.player.step === null) {
        const interaction = resolveInteraction(state.player, world.eventsOf(state.mapId))
        const message = interaction?.kind === 'sign' ? openMessage(world.pagesOf(interaction.dialogId) ?? missingDialogPages(interaction.dialogId)) : null

        return { ...state, interaction, message }
    }

    const player = stepPlayer(state.player, input, deltaMs, seamAwareRule(state.mapId, size, world))
    const transition = transitionReached(state.player, player, state.mapId, size, world)

    if (transition !== undefined) {
        // Freeze where the step landed; a held key must not walk on while the screen fades.
        return { ...state, player: { ...player, step: null }, fade: startFade(), pending: transition, interaction: undefined }
    }

    return { ...state, player, interaction: undefined }
}

/** Inside the map the collision rule decides; beyond an edge a seam may let the step through onto open ground. */
function seamAwareRule(mapId: Id, size: GridSize, world: FieldWorld): CanEnter {
    const inside = world.canEnter(mapId)

    return (from, to) => {
        if (isInside(size, to)) {
            return inside(from, to)
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
