import { DrawPort, PortSize } from './draw-port'

/** A message box in progress: which page of which text is showing. */
export type MessageState = {
    readonly pages: readonly string[]

    readonly index: number
}

/** The 240-wide view fits this many monospace characters per line at the box's font. */
export const MESSAGE_COLUMNS = 36

/** Lines per page, as on the GBA. */
export const MESSAGE_LINES = 2

export function openMessage(pages: readonly string[]): MessageState {
    return { pages: pages.length === 0 ? ['…'] : pages, index: 0 }
}

/** The next page, or null when the last page was confirmed: the box closes. */
export function advanceMessage(state: MessageState): MessageState | null {
    return state.index + 1 < state.pages.length ? { ...state, index: state.index + 1 } : null
}

export function currentPage(state: MessageState): string {
    return state.pages[state.index] ?? ''
}

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

    wrapText(currentPage(state), MESSAGE_COLUMNS).slice(0, MESSAGE_LINES).forEach((line, index) => {
        port.fillText(line, x + PADDING * zoom, y + (PADDING + index * LINE_HEIGHT) * zoom, FONT_SIZE * zoom, '#30304a')
    })

    if (!isLastPage(state)) {
        port.fillText('▼', x + width - (PADDING + 6) * zoom, y + height - (PADDING + 7) * zoom, (FONT_SIZE - 2) * zoom, '#c04040')
    }
}
