import { Cell } from './coordinates'
import { Id } from './id'
import { neighbour, Player } from './movement'
import { eventsAt, MapEvent } from './warp'

/** What the player found in front of them. The host decides what to show; this never opens UI. */
export type Interaction =
    | { readonly kind: 'sign'; readonly eventId: Id; readonly dialogId: Id }
    | { readonly kind: 'item'; readonly itemEventId: Id }
    | { readonly kind: 'npc'; readonly npcId: Id; readonly eventId: Id }

/** The cell the player faces. While stepping it is the cell beyond the step's target. */
export function cellInFront(player: Player): Cell {
    const standing = player.step === null ? player.cell : player.step.to

    return neighbour(standing, player.facing)
}

/** Who speaks first when several things share a cell: a person, then a thing to pick up, then a sign. */
const PRIORITY: readonly MapEvent['kind'][] = ['npc', 'item', 'sign']

/** The interaction on a cell, by authored priority, or undefined when nothing there answers. Warps are not interactive. */
export function interactionAt(events: readonly MapEvent[], cell: Cell): Interaction | undefined {
    const here = eventsAt(events, cell)

    for (const kind of PRIORITY) {
        const event = here.find(candidate => candidate.kind === kind)

        if (event === undefined) {
            continue
        }

        switch (event.kind) {
            case 'npc':
                return { kind: 'npc', npcId: event.npcId, eventId: event.id }
            case 'item':
                return { kind: 'item', itemEventId: event.id }
            case 'sign':
                return { kind: 'sign', eventId: event.id, dialogId: event.dialogId }
            case 'warp':
                continue
        }
    }

    return undefined
}

/** The interaction for the cell the player faces. */
export function resolveInteraction(player: Player, events: readonly MapEvent[]): Interaction | undefined {
    return interactionAt(events, cellInFront(player))
}
