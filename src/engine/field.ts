import { Connections, crossEdge } from '../domain/connection'
import { Cell } from '../domain/coordinates'
import { Id } from '../domain/id'
import { GridSize, isInside } from '../domain/map'
import { advanceStep, beginStep, CanEnter, Direction, MovementInput, newPlayer, Player, restingCell, stepPlayer, WALK_MS_PER_CELL } from '../domain/movement'
import { finishStep, newNpcMotion, NpcMotion, Random, tickNpcMotion } from '../domain/npc-behavior'
import { faceToward, Interaction, resolveInteraction } from '../domain/interact'
import { ItemEvent, MapEvent, NpcEvent, npcsOn, stepFinished, warpTaken } from '../domain/warp'
import { advanceFade, Fade, startFade } from './fade'
import { DialogPage, newPage } from '../domain/dialog'
import { addToVariable, hasFlag, Memory, newMemory, setFlag } from '../domain/flags'
import { sees } from '../domain/sight'
import { faceToward as turnToward } from '../domain/interact'
import { Bag, isTaken, newBag, pickUp } from '../domain/item'
import { healed, Party, Species } from '../domain/creature'
import { BattleRequest, BattleResult, EncounterTable, rollEncounter } from '../domain/encounter'
import { advanceMessage, currentPage, MessageState, missingDialogPages, moveHighlight, openMessage } from './message'
import { MenuEntry, MenuState, moveMenu, openMenu, selectedEntry } from './menu'
import { HealPoint, SavedSession } from '../domain/save'
import { BagScreenState, moveBagCursor, openBagScreen } from './bag-screen'
import { movePartyCursor, openPartyScreen, PartyScreenState } from './party-screen'

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

    /** The party screen while it is open (T-055), over the menu. */
    readonly partyScreen: PartyScreenState | null

    /** The person being talked to and the way they turned to face the player (T-043), while the message is open. */
    readonly talkingTo: { readonly eventId: Id; readonly facing: Direction } | null

    /** Where each person on this map is right now (T-044), seeded from the events the first frame they are seen. */
    readonly people: readonly NpcMotion[]

    /** The creatures the player carries (T-047). Battles change it through `afterBattle`. */
    readonly party: Party

    /** A battle the field just started (T-048 grass, T-049 trainers), for the host to run through its `BattleRunner`. Cleared by `afterBattle`. */
    readonly battle: BattleRequest | undefined

    /**
     * A trainer who spotted the player and is walking up (T-049). The player
     * stands frozen until the challenge lands. Once it has, `challengedBy`
     * remembers who, so a trainer not beaten (a loss, a flight) does not
     * challenge again until the player has walked away.
     */
    readonly approach: { readonly eventId: Id } | null

    readonly challengedBy: Id | null

    /** The last heal point used (T-056); a lost battle sends the player back here, or to the world's home when null. */
    readonly healPoint: HealPoint | null

    /** Set by a lost battle: when its message closes, the screen fades and the player wakes up here. */
    readonly retreat: Transition | null
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

    /** The within-map rule for `mapId`: collision, elevation, ledges, and (T-050) gates shut unless `memory` holds their flag. */
    canEnter(mapId: Id, memory: Memory): CanEnter

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

    speciesOf(speciesId: Id): Species | undefined

    /** Where a new game starts; a lost battle before any heal point was used returns here. */
    home: Transition
}

export function newField(mapId: Id, spawn: Cell, facing: Direction = 'down', memory: Memory = newMemory(), bag: Bag = newBag(), party: Party = [], healPoint: HealPoint | null = null): FieldState {
    return { mapId, player: newPlayer(spawn, facing), fade: null, pending: undefined, interaction: undefined, message: null, lastDirection: null, memory, bag, menu: null, menuChoice: undefined, bagScreen: null, partyScreen: null, talkingTo: null, people: [], party, battle: undefined, approach: null, challengedBy: null, healPoint, retreat: null }
}

/** What a save keeps of the session (T-041): the standing cell, never a half-finished step. */
export function snapshotField(state: FieldState): SavedSession {
    return { mapId: state.mapId, cell: restingCell(state.player), facing: state.player.facing, memory: state.memory, bag: state.bag, party: state.party, healPoint: state.healPoint }
}

/** A session resumed from a save: standing where it was saved, with its memory, bag, and party. */
export function restoreField(session: SavedSession): FieldState {
    return newField(session.mapId, session.cell, session.facing, session.memory, session.bag, session.party, session.healPoint)
}

/** After the host has written the save: the menu closes and the box says so. */
export function afterSave(state: FieldState): FieldState {
    return { ...state, menu: null, menuChoice: undefined, message: openMessage([newPage('Saved the game.')]) }
}

/** What the field says for each way out of a battle. */
export function battleOutcomeText(outcome: BattleResult['outcome']): string {
    switch (outcome) {
        case 'won':
            return 'You won!'
        case 'lost':
            return 'You lost...'
        case 'fled':
            return 'You got away.'
    }
}

export const RETREAT_TEXT = 'You hurried back to safety.'

export const NOTHING_CAME_TEXT = 'Something rustled in the grass, but nothing came out.'

/** A request the scene could not open (its species is gone from the project): dropped with a word, the field goes on. */
export function dismissBattle(state: FieldState): FieldState {
    return { ...state, battle: undefined, approach: null, challengedBy: state.battle?.trainer?.eventId ?? null, message: openMessage([newPage(NOTHING_CAME_TEXT)]) }
}

export const HEALED_TEXT = 'Your party is fully healed. This is now where you return after a loss.'

/** The party at full HP, each by its own species; a creature whose species is gone stays as it was. */
function healedParty(party: Party, world: FieldWorld): Party {
    return party.map(creature => {
        const species = world.speciesOf(creature.speciesId)

        return species === undefined ? creature : healed(creature, species)
    })
}

/**
 * After the host has run the battle scene: the request is consumed, a win is
 * counted in memory and keeps the party as the battle left it, and the box
 * tells how it ended. A loss (T-056) restores the party to its pre-battle
 * HP and, once the box closes, fades the player back to the last heal
 * point used — or to the world's home when none was.
 */
export function afterBattle(state: FieldState, result: BattleResult, world: FieldWorld): FieldState {
    const trainer = state.battle?.trainer ?? null
    const won = result.outcome === 'won'
    const lost = result.outcome === 'lost'
    const counted = won ? addToVariable(state.memory, 'battles-won', 1) : state.memory
    const ending = newPage(battleOutcomeText(result.outcome))

    return {
        ...state,
        battle: undefined,
        approach: null,
        challengedBy: trainer?.eventId ?? null,
        party: lost ? state.battle?.party ?? result.party : result.party,
        // A beaten trainer's flag is set, so they never challenge again. A loss leaves it clear (T-057 keeps this).
        memory: won && trainer !== null ? setFlag(counted, trainer.defeatedFlagId) : counted,
        retreat: lost ? state.healPoint ?? world.home : null,
        message: openMessage(lost ? [ending, newPage(RETREAT_TEXT)] : [ending]),
    }
}

/** The trainers on the map who have not been beaten yet and could spot the player from where they stand now. */
function spotter(state: FieldState, events: readonly MapEvent[], size: GridSize, world: FieldWorld): NpcEvent | undefined {
    const inside = world.canEnter(state.mapId, state.memory)
    const items = itemsOnMap(events, state.memory).map(item => item.cell)
    const target = state.player.cell

    return npcsOn(events).find(npc => {
        if (npc.trainer === null || npc.id === state.challengedBy || hasFlag(state.memory, npc.trainer.defeatedFlagId)) {
            return false
        }

        const mover = npcMover(state, npc)

        if (mover.step !== null) {
            return false
        }

        const others = state.people.filter(other => other.eventId !== npc.id).flatMap(other => footprint(other.mover))
        const blocked = (from: Cell, to: Cell) => !isInside(size, to) || !inside(from, to) || occupies([...items, ...others], to)

        return sees(mover.cell, mover.facing, npc.trainer.sightRange, target, blocked)
    })
}

/**
 * One frame of a trainer walking up: a step toward the player along their
 * line of sight while more than one cell away; standing beside them, the
 * challenge becomes the battle request and the player turns to face them.
 */
function approachFrame(state: FieldState, events: readonly MapEvent[], deltaMs: number, world: FieldWorld): FieldState {
    const eventId = state.approach?.eventId
    const npc = npcsOn(events).find(candidate => candidate.id === eventId)
    const motion = state.people.find(candidate => candidate.eventId === eventId)

    if (npc === undefined || npc.trainer === null || motion === undefined) {
        return { ...state, approach: null }
    }

    const mover = advanceStep(motion.mover, deltaMs)
    const people = state.people.map(candidate => candidate.eventId === eventId ? { ...candidate, mover } : candidate)

    if (mover.step !== null) {
        return { ...state, people }
    }

    const facing = turnToward(mover.cell, state.player.cell)

    if (facing !== undefined) {
        if (npc.trainer.party.length === 0) {
            // A trainer with nothing to send out just stops in front of the player.
            return { ...state, people, approach: null, player: { ...state.player, facing: turnToward(state.player.cell, mover.cell) ?? state.player.facing } }
        }

        const request: BattleRequest = {
            party: state.party,
            opponents: npc.trainer.party,
            trainer: { eventId: npc.id, name: npc.name, defeatedFlagId: npc.trainer.defeatedFlagId },
        }

        return { ...state, people, battle: request, player: { ...state.player, facing: turnToward(state.player.cell, mover.cell) ?? state.player.facing } }
    }

    const stepped = beginStep(mover, mover.facing, WALK_MS_PER_CELL, () => true)

    return { ...state, people: people.map(candidate => candidate.eventId === eventId ? { ...candidate, mover: stepped } : candidate) }
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
    return rememberingPage(advanceFrame(state, input, deltaMs, world))
}

/** A page that names a flag (T-050) sets it the frame it is shown; that is how a dialog opens a gate. */
function rememberingPage(state: FieldState): FieldState {
    const flagId = state.message === null ? undefined : currentPage(state.message).setsFlagId

    return flagId === undefined || hasFlag(state.memory, flagId) ? state : { ...state, memory: setFlag(state.memory, flagId) }
}

function advanceFrame(state: FieldState, input: FieldInput, deltaMs: number, world: FieldWorld): FieldState {
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

        // A lost battle's last word closes into the fade home (T-056).
        if (message === null && state.retreat !== null) {
            return { ...state, interaction: undefined, message, lastDirection: input.direction, menuChoice: undefined, talkingTo: null, people: [], fade: startFade(), pending: state.retreat, retreat: null }
        }

        // Once the conversation ends the person turns back the way they were.
        return { ...state, interaction: undefined, message, lastDirection: input.direction, menuChoice: undefined, talkingTo: message === null ? null : state.talkingTo, people: pausePeople(state.people, deltaMs) }
    }

    if (state.bagScreen !== null) {
        const count = state.bag.length
        const moved = pressed === 'up' ? moveBagCursor(state.bagScreen, -1, count) : pressed === 'down' ? moveBagCursor(state.bagScreen, 1, count) : state.bagScreen

        // The menu key steps back to the menu; there is nothing to do with an item yet, so the interact key does too.
        return { ...state, interaction: undefined, menuChoice: undefined, bagScreen: input.menu || input.interact ? null : moved, lastDirection: input.direction, people: pausePeople(state.people, deltaMs) }
    }

    if (state.partyScreen !== null) {
        const count = state.party.length
        const moved = pressed === 'up' ? movePartyCursor(state.partyScreen, -1, count) : pressed === 'down' ? movePartyCursor(state.partyScreen, 1, count) : state.partyScreen

        // Nothing can be done to a creature here yet, so either key steps back to the menu.
        return { ...state, interaction: undefined, menuChoice: undefined, partyScreen: input.menu || input.interact ? null : moved, lastDirection: input.direction, people: pausePeople(state.people, deltaMs) }
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
            partyScreen: choice === 'party' ? openPartyScreen() : null,
            lastDirection: input.direction,
            people: pausePeople(state.people, deltaMs),
        }
    }

    if (state.approach !== null) {
        return approachFrame({ ...state, interaction: undefined, menuChoice: undefined, lastDirection: input.direction }, world.eventsOf(state.mapId), deltaMs, world)
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

    // A standing player in a trainer's line of sight is spotted before anything else happens this frame.
    if (state.player.step === null) {
        const trainer = spotter(synced, mapEvents, size, world)

        if (trainer !== undefined) {
            return { ...synced, approach: { eventId: trainer.id }, interaction: undefined, menuChoice: undefined, lastDirection: input.direction }
        }
    }

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

        if (interaction?.kind === 'heal') {
            const healPoint = { mapId: state.mapId, cell: state.player.cell, facing: state.player.facing }

            return { ...synced, interaction, message: openMessage([newPage(HEALED_TEXT)]), party: healedParty(state.party, world), healPoint, lastDirection: input.direction, menuChoice: undefined }
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

    // Walking away from a trainer who was not beaten lets them challenge again next time they see the player.
    const challengedBy = stepFinished(state.player, player) ? null : state.challengedBy

    return { ...state, player, interaction: undefined, lastDirection: input.direction, menuChoice: undefined, people, challengedBy }
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
    const inside = world.canEnter(state.mapId, state.memory)
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
    const inside = world.canEnter(mapId, memory)
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
