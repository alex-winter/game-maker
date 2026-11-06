import { DrawPort, PortSize } from './draw-port'

/** The field start menu's entries, top to bottom. Later tickets fill the screens in; Close always works. */
export const MENU_ENTRIES = ['bag', 'party', 'save', 'close'] as const

export type MenuEntry = (typeof MENU_ENTRIES)[number]

const LABELS: { readonly [E in MenuEntry]: string } = {
    bag: 'BAG',
    party: 'PARTY',
    save: 'SAVE',
    close: 'CLOSE',
}

/** The start menu while it is open: only which entry the cursor is on. */
export type MenuState = {
    readonly highlight: number
}

export function openMenu(): MenuState {
    return { highlight: 0 }
}

/** Moves the cursor by `delta`, wrapping at both ends like the GBA menu. */
export function moveMenu(state: MenuState, delta: number): MenuState {
    const count = MENU_ENTRIES.length

    return { highlight: (((state.highlight + delta) % count) + count) % count }
}

export function selectedEntry(state: MenuState): MenuEntry {
    return MENU_ENTRIES[state.highlight] ?? 'close'
}

const FONT_SIZE = 10

const LINE_HEIGHT = 12

const PADDING = 6

const MARGIN = 4

const BORDER = 2

const CHARACTER_WIDTH = FONT_SIZE * 0.6

/**
 * Draws the menu in the top-right corner of the view: a bordered panel, one
 * row per entry, a cursor on the highlighted one. Entries not in `enabled`
 * are greyed; they still show so the author sees what is coming.
 */
export function drawMenu(port: DrawPort<unknown>, state: MenuState, view: PortSize, zoom: number, enabled: ReadonlySet<MenuEntry>): void {
    const longest = Math.max(...MENU_ENTRIES.map(entry => LABELS[entry].length))
    const width = (PADDING * 2 + CHARACTER_WIDTH * (longest + 2)) * zoom
    const height = (PADDING * 2 + MENU_ENTRIES.length * LINE_HEIGHT) * zoom
    const x = (view.width - MARGIN) * zoom - width
    const y = MARGIN * zoom

    port.fillRect(x, y, width, height, '#30304a')
    port.fillRect(x + BORDER * zoom, y + BORDER * zoom, width - BORDER * 2 * zoom, height - BORDER * 2 * zoom, '#f8f4e8')

    MENU_ENTRIES.forEach((entry, index) => {
        const rowY = y + (PADDING + index * LINE_HEIGHT) * zoom

        if (index === state.highlight) {
            port.fillText('▶', x + PADDING * zoom, rowY, FONT_SIZE * zoom, '#c04040')
        }

        port.fillText(LABELS[entry], x + (PADDING + CHARACTER_WIDTH * 2) * zoom, rowY, FONT_SIZE * zoom, enabled.has(entry) ? '#30304a' : '#a0a0a8')
    })
}
