import { DialogPage, newPage } from '../domain/dialog'
import { Id } from '../domain/id'
import { DrawPort, PortSize } from './draw-port'

/** A message box in progress: which page of which text is showing, and which choice is highlighted. */
export type MessageState = {
    readonly pages: readonly DialogPage[]

    readonly index: number

    /** Which of the current page's choices the cursor is on. 0 on a page without choices. */
    readonly highlight: number
}

/** Answers a choice's `nextDialogId` with that dialog's pages, or undefined when no dialog has the id. */
export type ResolveDialog = (dialogId: Id) => readonly DialogPage[] | undefined

/** The 240-wide view fits this many monospace characters per line at the box's font. */
export const MESSAGE_COLUMNS = 36

/** Lines per page, as on the GBA. */
export const MESSAGE_LINES = 2

export function openMessage(pages: readonly DialogPage[]): MessageState {
    return { pages: pages.length === 0 ? [newPage('…')] : pages, index: 0, highlight: 0 }
}

/** What a choice that points at a deleted dialog says, so the author sees which id to fix. */
export function missingDialogPages(dialogId: Id): DialogPage[] {
    return [newPage(`(No dialog "${dialogId}" exists yet.)`)]
}

/**
 * Confirm. On a page with choices the highlighted choice decides: its
 * dialog opens from its first page, or null ends the conversation.
 * Otherwise the next page shows, or null when the last page was confirmed.
 */
export function advanceMessage(state: MessageState, resolve: ResolveDialog = () => undefined): MessageState | null {
    const choice = currentPage(state).choices[state.highlight]

    if (choice !== undefined) {
        return choice.nextDialogId === null ? null : openMessage(resolve(choice.nextDialogId) ?? missingDialogPages(choice.nextDialogId))
    }

    return state.index + 1 < state.pages.length ? { ...state, index: state.index + 1, highlight: 0 } : null
}

/** Moves the cursor by `delta` through the current page's choices, stopping at the ends. */
export function moveHighlight(state: MessageState, delta: number): MessageState {
    const count = currentPage(state).choices.length

    if (count === 0) {
        return state
    }

    return { ...state, highlight: Math.min(count - 1, Math.max(0, state.highlight + delta)) }
}

export function currentPage(state: MessageState): DialogPage {
    return state.pages[state.index] ?? newPage('')
}

/** The last page, with nothing to choose: the next confirm closes the box. */
export function isLastPage(state: MessageState): boolean {
    return state.index === state.pages.length - 1
}

/**
 * Breaks one page into lines of at most `columns` characters at spaces.
 * A word longer than a line is split. Explicit "\n" always breaks.
 */
export function wrapText(text: string, columns: number): string[] {
    const lines: string[] = []

    for (const paragraph of text.split('\n')) {
        let line = ''

        for (const word of paragraph.split(' ').filter(word => word.length > 0)) {
            let remaining = word

            while (remaining.length > columns) {
                if (line.length > 0) {
                    lines.push(line)
                    line = ''
                }

                lines.push(remaining.slice(0, columns))
                remaining = remaining.slice(columns)
            }

            if (line.length === 0) {
                line = remaining
            } else if (line.length + 1 + remaining.length <= columns) {
                line += ' ' + remaining
            } else {
                lines.push(line)
                line = remaining
            }
        }

        lines.push(line)
    }

    return lines
}

/** Pixel size of the box's monospace font inside the 240×160 view. Characters are about 0.6 em wide. */
const FONT_SIZE = 10

const LINE_HEIGHT = 12

const PADDING = 6

const MARGIN = 4

const BORDER = 2

/** The box's height in view pixels: two lines plus padding. */
export const MESSAGE_BOX_HEIGHT = MESSAGE_LINES * LINE_HEIGHT + PADDING * 2

/**
 * Draws the open message along the bottom of the view: a dark border, a
 * cream panel, up to two wrapped lines, and a mark when more pages follow.
 * `view` is the unscaled 240×160 size; `zoom` the whole-pixel scale drawn at.
 */
export function drawMessageBox(port: DrawPort<unknown>, state: MessageState, view: PortSize, zoom: number): void {
    const x = MARGIN * zoom
    const y = (view.height - MARGIN - MESSAGE_BOX_HEIGHT) * zoom
    const width = (view.width - MARGIN * 2) * zoom
    const height = MESSAGE_BOX_HEIGHT * zoom

    port.fillRect(x, y, width, height, '#30304a')
    port.fillRect(x + BORDER * zoom, y + BORDER * zoom, width - BORDER * 2 * zoom, height - BORDER * 2 * zoom, '#f8f4e8')

    const page = currentPage(state)

    wrapText(page.text, MESSAGE_COLUMNS).slice(0, MESSAGE_LINES).forEach((line, index) => {
        port.fillText(line, x + PADDING * zoom, y + (PADDING + index * LINE_HEIGHT) * zoom, FONT_SIZE * zoom, '#30304a')
    })

    if (page.choices.length > 0) {
        drawChoices(port, state, view, zoom, y)
    } else if (!isLastPage(state)) {
        port.fillText('▼', x + width - (PADDING + 6) * zoom, y + height - (PADDING + 7) * zoom, (FONT_SIZE - 2) * zoom, '#c04040')
    }
}

/** Width of one character of the box's monospace font, in view pixels. */
const CHARACTER_WIDTH = FONT_SIZE * 0.6

/** The choice box sits above the message box against the right edge; the cursor marks the highlighted row. */
function drawChoices(port: DrawPort<unknown>, state: MessageState, view: PortSize, zoom: number, messageTop: number): void {
    const { choices } = currentPage(state)
    const longest = Math.max(...choices.map(choice => choice.label.length))
    const width = (PADDING * 2 + CHARACTER_WIDTH * (longest + 2)) * zoom
    const height = (PADDING * 2 + choices.length * LINE_HEIGHT) * zoom
    const x = (view.width - MARGIN) * zoom - width
    const y = messageTop - MARGIN * zoom - height

    port.fillRect(x, y, width, height, '#30304a')
    port.fillRect(x + BORDER * zoom, y + BORDER * zoom, width - BORDER * 2 * zoom, height - BORDER * 2 * zoom, '#f8f4e8')

    choices.forEach((choice, index) => {
        const rowY = y + (PADDING + index * LINE_HEIGHT) * zoom

        if (index === state.highlight) {
            port.fillText('▶', x + PADDING * zoom, rowY, FONT_SIZE * zoom, '#c04040')
        }

        port.fillText(choice.label, x + (PADDING + CHARACTER_WIDTH * 2) * zoom, rowY, FONT_SIZE * zoom, '#30304a')
    })
}
