import { Id } from './id'

/** A named switch the story can set: "got the potion", "talked to the elder". The author names it; events refer to its id. */
export type Flag = {
    readonly id: Id

    name: string
}

/**
 * What a play session remembers: which flags are set and the numbers the
 * story counts. Plain data so T-041 can write it to disk as it is.
 */
export type Memory = {
    /** Ids of the flags that are true. Anything not here reads as false. */
    readonly flags: readonly Id[]

    /** Story numbers by key: a step count, a score, money. Unknown keys read as 0. */
    readonly variables: { readonly [key: string]: number }
}

export function newFlag(id: Id, name: string): Flag {
    return { id, name }
}

export function newMemory(): Memory {
    return { flags: [], variables: {} }
}

export function hasFlag(memory: Memory, flagId: Id): boolean {
    return memory.flags.includes(flagId)
}

export function setFlag(memory: Memory, flagId: Id): Memory {
    return hasFlag(memory, flagId) ? memory : { ...memory, flags: [...memory.flags, flagId] }
}

export function clearFlag(memory: Memory, flagId: Id): Memory {
    return hasFlag(memory, flagId) ? { ...memory, flags: memory.flags.filter(id => id !== flagId) } : memory
}

export function variable(memory: Memory, key: string): number {
    return memory.variables[key] ?? 0
}

export function withVariable(memory: Memory, key: string, value: number): Memory {
    return { ...memory, variables: { ...memory.variables, [key]: value } }
}

export function addToVariable(memory: Memory, key: string, delta: number): Memory {
    return withVariable(memory, key, variable(memory, key) + delta)
}

/** A trimmed, non-empty name. */
export function isFlagInput(value: unknown): value is Omit<Flag, 'id'> {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const flag = value as { name?: unknown }

    return typeof flag.name === 'string' && flag.name.trim().length > 0
}

export function isMemory(value: unknown): value is Memory {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const memory = value as { flags?: unknown; variables?: unknown }

    return Array.isArray(memory.flags) && memory.flags.every(id => typeof id === 'string')
        && typeof memory.variables === 'object' && memory.variables !== null
        && Object.values(memory.variables).every(number => typeof number === 'number' && Number.isFinite(number))
}
