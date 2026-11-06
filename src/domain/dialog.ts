import { Id } from './id'

/**
 * Something a sign or person says: pages of text shown one at a time.
 * Page breaks are explicit — an author writes pages, the runner never
 * re-paginates. Choices arrive in T-037.
 */
export type Dialog = {
    readonly id: Id

    name: string

    pages: string[]
}

export function newDialog(id: Id, name: string, pages: string[]): Dialog {
    return { id, name, pages }
}

/** A trimmed name and at least one page. */
export function isDialogInput(value: unknown): value is Omit<Dialog, 'id'> {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const dialog = value as { name?: unknown; pages?: unknown }

    return typeof dialog.name === 'string' && dialog.name.trim().length > 0
        && Array.isArray(dialog.pages) && dialog.pages.length > 0 && dialog.pages.every(page => typeof page === 'string')
}
