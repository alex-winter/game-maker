import { hasFlag, Memory, setFlag } from './flags'
import { Id } from './id'
import { ItemEvent } from './warp'

/** Something the player can carry. What it does comes later; for now it is a name the bag shows. */
export type Item = {
    readonly id: Id

    name: string

    description: string
}

/** One stack in the bag. */
export type BagEntry = {
    readonly itemId: Id

    readonly count: number
}

/** What the player carries, in the order things were first found. Plain data so a save can hold it. */
export type Bag = readonly BagEntry[]

export function newItem(id: Id, name: string, description = ''): Item {
    return { id, name, description }
}

export function newBag(): Bag {
    return []
}

export function bagCount(bag: Bag, itemId: Id): number {
    return bag.find(entry => entry.itemId === itemId)?.count ?? 0
}

export function addToBag(bag: Bag, itemId: Id, count = 1): Bag {
    return bag.some(entry => entry.itemId === itemId)
        ? bag.map(entry => (entry.itemId === itemId ? { ...entry, count: entry.count + count } : entry))
        : [...bag, { itemId, count }]
}

/** An item on the ground is gone once its flag is set. */
export function isTaken(event: ItemEvent, memory: Memory): boolean {
    return hasFlag(memory, event.flagId)
}

export type Pickup = {
    readonly bag: Bag

    readonly memory: Memory

    /** True when the flag was already set: nothing was added. */
    readonly alreadyTaken: boolean
}

/** Picking an item up: once. The flag remembers; the second time nothing changes. */
export function pickUp(bag: Bag, memory: Memory, event: ItemEvent): Pickup {
    if (isTaken(event, memory)) {
        return { bag, memory, alreadyTaken: true }
    }

    return { bag: addToBag(bag, event.itemId), memory: setFlag(memory, event.flagId), alreadyTaken: false }
}

/** A trimmed, non-empty name and a string description. */
export function isItemInput(value: unknown): value is Omit<Item, 'id'> {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const item = value as { name?: unknown; description?: unknown }

    return typeof item.name === 'string' && item.name.trim().length > 0 && typeof item.description === 'string'
}

export function isBag(value: unknown): value is Bag {
    return Array.isArray(value) && value.every(entry => (
        typeof entry === 'object' && entry !== null
        && typeof (entry as { itemId?: unknown }).itemId === 'string'
        && Number.isInteger((entry as { count?: unknown }).count)
    ))
}
