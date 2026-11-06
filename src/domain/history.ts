/**
 * An undo/redo stack of immutable snapshots. `past` holds the states before
 * each recorded edit, newest last; `future` holds the states undone, next
 * redo last. The value in hand (the current state) is not stored here.
 */
export type History<T> = {
    readonly past: readonly T[]

    readonly future: readonly T[]

    /** How many undo steps are kept. Older ones fall off the bottom. */
    readonly limit: number
}

export const DEFAULT_HISTORY_LIMIT = 50

export function emptyHistory<T>(limit: number = DEFAULT_HISTORY_LIMIT): History<T> {
    return { past: [], future: [], limit }
}

/** Records the state an edit replaced. A new edit drops the redo branch. */
export function record<T>(history: History<T>, before: T): History<T> {
    const past = [...history.past, before]

    return {
        past: past.length > history.limit ? past.slice(past.length - history.limit) : past,
        future: [],
        limit: history.limit,
    }
}

export function canUndo<T>(history: History<T>): boolean {
    return history.past.length > 0
}

export function canRedo<T>(history: History<T>): boolean {
    return history.future.length > 0
}

/** Steps back: the previous state comes out, `current` goes onto the redo branch. */
export function undo<T>(history: History<T>, current: T): { history: History<T>; state: T } | undefined {
    const state = history.past[history.past.length - 1]

    if (state === undefined) {
        return undefined
    }

    return {
        history: { past: history.past.slice(0, -1), future: [...history.future, current], limit: history.limit },
        state,
    }
}

/** Steps forward again: the next undone state comes out, `current` goes back onto the undo stack. */
export function redo<T>(history: History<T>, current: T): { history: History<T>; state: T } | undefined {
    const state = history.future[history.future.length - 1]

    if (state === undefined) {
        return undefined
    }

    return {
        history: { past: [...history.past, current], future: history.future.slice(0, -1), limit: history.limit },
        state,
    }
}
