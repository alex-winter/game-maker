import { GRID_SIZE } from 'domain/grid'
import { MapEvent } from 'domain/warp'
import { Cell } from 'domain/coordinates'
import { View, worldToScreen } from 'engine/view'

const WARP_FILL = 'rgba(155, 89, 182, 0.55)'
const SIGN_FILL = 'rgba(241, 196, 15, 0.55)'
const OTHER_FILL = 'rgba(46, 204, 113, 0.55)'
const WARP_STROKE = 'rgba(255, 255, 255, 0.9)'

const HEAL_FILL = 'rgba(231, 76, 60, 0.55)'
const SPAWN_STROKE = 'rgba(44, 62, 80, 0.95)'

const LETTER: { readonly [K in MapEvent['kind']]: string } = { warp: 'W', sign: 'S', item: 'I', npc: 'N', heal: 'H' }
const FILL: { readonly [K in MapEvent['kind']]: string } = { warp: WARP_FILL, sign: SIGN_FILL, item: OTHER_FILL, npc: OTHER_FILL, heal: HEAL_FILL }

/** Draws each map event as a lettered marker on its cell: purple W for warps, yellow S for signs, green I/N for items and people, red H for heal points. */
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

/** Where play starts on this map (T-058): a dark ring with a P, drawn over whatever event shares the cell. */
export function drawSpawn(ctx: CanvasRenderingContext2D, view: View, spawn: Cell): void {
    const size = GRID_SIZE * view.zoom
    const screen = worldToScreen(view, { x: spawn.x * GRID_SIZE, y: spawn.y * GRID_SIZE })

    ctx.strokeStyle = SPAWN_STROKE
    ctx.lineWidth = 2
    ctx.strokeRect(screen.x + 1.5, screen.y + 1.5, size - 3, size - 3)
    ctx.fillStyle = SPAWN_STROKE
    ctx.font = `bold ${Math.max(8, Math.floor(size * 0.5))}px sans-serif`
    ctx.textAlign = 'right'
    ctx.textBaseline = 'bottom'
    ctx.fillText('P', screen.x + size - 2, screen.y + size - 1)
}
