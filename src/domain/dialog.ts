import { Id } from './id'

/** One answer the player can pick: where it leads, or null to end the conversation. */
export type Choice = {
    label: string

    nextDialogId: Id | null
}

/** What the message box shows at once. Choices, when any, appear with this page and confirm branches. */
export type DialogPage = {
    text: string

    choices: Choice[]

    /** A story flag set the moment this page is shown (T-050): how a conversation opens a gate. */
    setsFlagId?: Id
}

/**
 * Something a sign or person says: pages of text shown one at a time.
 * Page breaks are explicit — an author writes pages, the runner never
 * re-paginates.
 */
export type Dialog = {
    readonly id: Id

    name: string

    pages: DialogPage[]
}

/** As many as the GBA's choice box held. */
export const MAX_CHOICES = 4

export function newPage(text: string, choices: Choice[] = []): DialogPage {
    return { text, choices }
}

export function newDialog(id: Id, name: string, pages: DialogPage[]): Dialog {
    return { id, name, pages }
}

function isChoice(value: unknown): value is Choice {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const choice = value as { label?: unknown; nextDialogId?: unknown }

    return typeof choice.label === 'string' && (choice.nextDialogId === null || typeof choice.nextDialogId === 'string')
}

export function isDialogPage(value: unknown): value is DialogPage {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const page = value as { text?: unknown; choices?: unknown; setsFlagId?: unknown }

    return typeof page.text === 'string'
        && Array.isArray(page.choices) && page.choices.length <= MAX_CHOICES && page.choices.every(isChoice)
        && (page.setsFlagId === undefined || typeof page.setsFlagId === 'string')
}

/** A trimmed name and at least one page. */
export function isDialogInput(value: unknown): value is Omit<Dialog, 'id'> {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const dialog = value as { name?: unknown; pages?: unknown }

    return typeof dialog.name === 'string' && dialog.name.trim().length > 0
        && Array.isArray(dialog.pages) && dialog.pages.length > 0 && dialog.pages.every(isDialogPage)
}

/** A page stored by T-035 was a bare string; it reads as a page without choices. */
export function withPageDefaults(stored: DialogPage | string): DialogPage {
    return typeof stored === 'string' ? newPage(stored) : { text: stored.text, choices: stored.choices ?? [], ...(stored.setsFlagId === undefined ? {} : { setsFlagId: stored.setsFlagId }) }
}

export function withDialogDefaults(stored: Omit<Dialog, 'pages'> & { pages: (DialogPage | string)[] }): Dialog {
    return { ...stored, pages: stored.pages.map(withPageDefaults) }
}
