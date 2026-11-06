import { Bag } from '../domain/item'
import { Id } from '../domain/id'
import { DrawPort, PortSize } from './draw-port'

/** The bag screen while it is open: which stack the cursor is on. */
export type BagScreenState = {
    readonly highlight: number
}

/** What the screen needs to know about an item beyond its id. */
export type ItemLookup = (itemId: Id) => { readonly name: string; readonly description: string } | undefined

export function openBagScreen(): BagScreenState {
    return { highlight: 0 }
}

/** Moves the cursor by `delta` through `count` stacks, stopping at the ends. */
export function moveBagCursor(state: BagScreenState, delta: number, count: number): BagScreenState {
    if (count === 0) {
        return { highlight: 0 }
    }

    return { highlight: Math.min(count - 1, Math.max(0, state.highlight + delta)) }
}

const FONT_SIZE = 10

const LINE_HEIGHT = 12

const PADDING = 6

const MARGIN = 4

const BORDER = 2

const CHARACTER_WIDTH = FONT_SIZE * 0.6

/** Rows the list panel shows at once; the list scrolls to keep the cursor visible. */
export const BAG_ROWS = 7

function panel(port: DrawPort<unknown>, x: number, y: number, width: number, height: number, zoom: number): void {
    port.fillRect(x, y, width, height, '#30304a')
    port.fillRect(x + BORDER * zoom, y + BORDER * zoom, width - BORDER * 2 * zoom, height - BORDER * 2 * zoom, '#f8f4e8')
}

/** The first row shown so the highlighted one is on screen. */
export function firstVisibleRow(highlight: number, count: number, rows = BAG_ROWS): number {
    return Math.max(0, Math.min(highlight - rows + 1, count - rows))
}

/**
 * Draws the bag over the whole view: a list panel of `NAME ×count` rows
 * with a cursor, and a description panel along the bottom for the
 * highlighted item. An empty bag says so.
 */
export function drawBagScreen(port: DrawPort<unknown>, bag: Bag, lookup: ItemLookup, state: BagScreenState, view: PortSize, zoom: number): void {
    const x = MARGIN * zoom
    const y = MARGIN * zoom
    const width = (view.width - MARGIN * 2) * zoom
    const descriptionHeight = (PADDING * 2 + 2 * LINE_HEIGHT) * zoom
    const listHeight = (view.height - MARGIN * 3) * zoom - descriptionHeight

    panel(port, x, y, width, listHeight, zoom)
    port.fillText('BAG', x + PADDING * zoom, y + PADDING * zoom, FONT_SIZE * zoom, '#30304a')

    if (bag.length === 0) {
        port.fillText('Nothing in the bag.', x + (PADDING + CHARACTER_WIDTH * 2) * zoom, y + (PADDING + LINE_HEIGHT) * zoom, FONT_SIZE * zoom, '#a0a0a8')
    }

    const first = firstVisibleRow(state.highlight, bag.length)

    bag.slice(first, first + BAG_ROWS).forEach((entry, row) => {
        const index = first + row
        const rowY = y + (PADDING + (row + 1) * LINE_HEIGHT) * zoom
        const name = lookup(entry.itemId)?.name ?? '???'

        if (index === state.highlight) {
            port.fillText('▶', x + PADDING * zoom, rowY, FONT_SIZE * zoom, '#c04040')
        }

        port.fillText(name.toUpperCase(), x + (PADDING + CHARACTER_WIDTH * 2) * zoom, rowY, FONT_SIZE * zoom, '#30304a')
        port.fillText(`×${entry.count}`, x + width - (PADDING + CHARACTER_WIDTH * 4) * zoom, rowY, FONT_SIZE * zoom, '#30304a')
    })

    const descriptionY = y + listHeight + MARGIN * zoom

    panel(port, x, descriptionY, width, descriptionHeight, zoom)

    const highlighted = bag[state.highlight]
    const description = highlighted === undefined ? '' : lookup(highlighted.itemId)?.description ?? ''

    port.fillText(description, x + PADDING * zoom, descriptionY + PADDING * zoom, FONT_SIZE * zoom, '#30304a')
}
