import { GRID_SIZE } from 'domain/grid'
import { MapEvent } from 'domain/warp'
import { View, worldToScreen } from 'engine/view'

const WARP_FILL = 'rgba(155, 89, 182, 0.55)'
const SIGN_FILL = 'rgba(241, 196, 15, 0.55)'
const OTHER_FILL = 'rgba(46, 204, 113, 0.55)'
const WARP_STROKE = 'rgba(255, 255, 255, 0.9)'

const LETTER: { readonly [K in MapEvent['kind']]: string } = { warp: 'W', sign: 'S', item: 'I', npc: 'N' }
const FILL: { readonly [K in MapEvent['kind']]: string } = { warp: WARP_FILL, sign: SIGN_FILL, item: OTHER_FILL, npc: OTHER_FILL }

/** Draws each map event as a lettered marker on its cell: purple W for warps, yellow S for signs, green I/N for items and people. */
export function drawEvents(ctx: CanvasRenderingContext2D, view: View, events: readonly MapEvent[]): void {
    const size = GRID_SIZE * view.zoom

    for (const event of events) {
        const screen = worldToScreen(view, { x: event.cell.x * GRID_SIZE, y: event.cell.y * GRID_SIZE })

        ctx.fillStyle = FILL[event.kind]
        ctx.fillRect(screen.x, screen.y, size, size)
        ctx.strokeStyle = WARP_STROKE
        ctx.lineWidth = 1
        ctx.strokeRect(screen.x + 0.5, screen.y + 0.5, size - 1, size - 1)
        ctx.fillStyle = WARP_STROKE
        ctx.font = `bold ${Math.max(8, Math.floor(size * 0.6))}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(LETTER[event.kind], screen.x + size / 2, screen.y + size / 2 + 1)
    }
}
