import { Creature, maxHpAt, Party, Species } from '../domain/creature'
import { Id } from '../domain/id'
import { DrawPort, PortSize } from './draw-port'

/**
 * The party screen (T-055): the start menu's Party entry. A list of the
 * party — name, level, HP — with a cursor, and a detail panel for the
 * highlighted creature's moves. Nothing is reordered here.
 */
export type PartyScreenState = {
    readonly highlight: number
}

/** What the screen needs beyond the creatures: their species and the names of their moves. */
export type PartyLookup = {
    readonly speciesOf: (speciesId: Id) => Species | undefined

    readonly moveName: (moveId: Id) => string | undefined
}

export function openPartyScreen(): PartyScreenState {
    return { highlight: 0 }
}

/** Moves the cursor by `delta` through `count` creatures, stopping at the ends. */
export function movePartyCursor(state: PartyScreenState, delta: number, count: number): PartyScreenState {
    if (count === 0) {
        return { highlight: 0 }
    }

    return { highlight: Math.min(count - 1, Math.max(0, state.highlight + delta)) }
}

/** One list row: `SPROUT  Lv7  22/28`. */
export function partyRow(creature: Creature, lookup: PartyLookup): { readonly name: string; readonly level: string; readonly hp: string } {
    const species = lookup.speciesOf(creature.speciesId)
    const max = species === undefined ? creature.hp : maxHpAt(species, creature.level)

    return { name: (species?.name ?? '???').toUpperCase(), level: `Lv${creature.level}`, hp: `${creature.hp}/${max}` }
}

const FONT_SIZE = 10

const LINE_HEIGHT = 12

const PADDING = 6

const MARGIN = 4

const BORDER = 2

const CHARACTER_WIDTH = FONT_SIZE * 0.6

const INK = '#30304a'

const FAINT = '#a0a0a8'

function panel(port: DrawPort<unknown>, x: number, y: number, width: number, height: number, zoom: number): void {
    port.fillRect(x, y, width, height, INK)
    port.fillRect(x + BORDER * zoom, y + BORDER * zoom, width - BORDER * 2 * zoom, height - BORDER * 2 * zoom, '#f8f4e8')
}

function hpColor(fraction: number): string {
    return fraction > 0.5 ? '#48b848' : fraction > 0.2 ? '#e0c030' : '#d04040'
}

/**
 * Draws the party over the whole view: a list panel on the left with one
 * row per creature (cursor, name, level, HP bar and numbers) and a detail
 * panel on the right naming the highlighted creature's moves. An empty
 * party says so.
 */
export function drawPartyScreen(port: DrawPort<unknown>, party: Party, lookup: PartyLookup, state: PartyScreenState, view: PortSize, zoom: number): void {
    const x = MARGIN * zoom
    const y = MARGIN * zoom
    const height = (view.height - MARGIN * 2) * zoom
    const listWidth = 150 * zoom
    const detailX = x + listWidth + MARGIN * zoom
    const detailWidth = (view.width - MARGIN) * zoom - detailX

    panel(port, x, y, listWidth, height, zoom)
    port.fillText('PARTY', x + PADDING * zoom, y + PADDING * zoom, FONT_SIZE * zoom, INK)

    if (party.length === 0) {
        port.fillText('Nobody yet.', x + (PADDING + CHARACTER_WIDTH * 2) * zoom, y + (PADDING + LINE_HEIGHT) * zoom, FONT_SIZE * zoom, FAINT)
    }

    party.forEach((creature, index) => {
        const rowY = y + (PADDING + LINE_HEIGHT + index * (LINE_HEIGHT * 2)) * zoom
        const row = partyRow(creature, lookup)
        const species = lookup.speciesOf(creature.speciesId)
        const max = species === undefined ? Math.max(1, creature.hp) : maxHpAt(species, creature.level)
        const fraction = max === 0 ? 0 : creature.hp / max
        const color = creature.hp === 0 ? FAINT : INK

        if (index === state.highlight) {
            port.fillText('▶', x + PADDING * zoom, rowY, FONT_SIZE * zoom, '#c04040')
        }

        port.fillText(row.name, x + (PADDING + CHARACTER_WIDTH * 2) * zoom, rowY, FONT_SIZE * zoom, color)
        port.fillText(row.level, x + (PADDING + CHARACTER_WIDTH * 14) * zoom, rowY, FONT_SIZE * zoom, color)

        const barX = x + (PADDING + CHARACTER_WIDTH * 2) * zoom
        const barY = rowY + (LINE_HEIGHT + 1) * zoom
        const barWidth = 60 * zoom

        port.fillRect(barX, barY, barWidth, 4 * zoom, FAINT)
        port.fillRect(barX, barY, Math.round(barWidth * fraction), 4 * zoom, hpColor(fraction))
        port.fillText(row.hp, barX + barWidth + CHARACTER_WIDTH * zoom, rowY + (LINE_HEIGHT - 2) * zoom, FONT_SIZE * zoom, color)
    })

    panel(port, detailX, y, detailWidth, height, zoom)

    const chosen = party[state.highlight]

    if (chosen === undefined) {
        return
    }

    const species = lookup.speciesOf(chosen.speciesId)
    const detail = partyRow(chosen, lookup)

    port.fillText(detail.name, detailX + PADDING * zoom, y + PADDING * zoom, FONT_SIZE * zoom, INK)
    port.fillText((species?.types ?? []).join('/').toUpperCase(), detailX + PADDING * zoom, y + (PADDING + LINE_HEIGHT) * zoom, FONT_SIZE * zoom, FAINT)
    port.fillText('MOVES', detailX + PADDING * zoom, y + (PADDING + LINE_HEIGHT * 3) * zoom, FONT_SIZE * zoom, INK)

    if (chosen.moves.length === 0) {
        port.fillText('none', detailX + (PADDING + CHARACTER_WIDTH * 2) * zoom, y + (PADDING + LINE_HEIGHT * 4) * zoom, FONT_SIZE * zoom, FAINT)
    }

    chosen.moves.forEach((moveId, index) => {
        port.fillText((lookup.moveName(moveId) ?? '???').toUpperCase(), detailX + (PADDING + CHARACTER_WIDTH * 2) * zoom, y + (PADDING + LINE_HEIGHT * (4 + index)) * zoom, FONT_SIZE * zoom, INK)
    })

    port.fillText(`EXP ${chosen.experience}`, detailX + PADDING * zoom, y + (PADDING + LINE_HEIGHT * 9) * zoom, FONT_SIZE * zoom, FAINT)
}
