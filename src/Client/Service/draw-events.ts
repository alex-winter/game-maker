import { GRID_SIZE } from 'domain/grid'
import { MapEvent } from 'domain/warp'
import { View, worldToScreen } from 'engine/view'

const WARP_FILL = 'rgba(155, 89, 182, 0.55)'
const WARP_STROKE = 'rgba(255, 255, 255, 0.9)'

/** Draws each map event as a marker on its cell: warps as a purple cell with a "W". */
export function drawEvents(ctx: CanvasRenderingContext2D, view: View, events: readonly MapEvent[]): void {
    const size = GRID_SIZE * view.zoom

    for (const event of events) {
        const screen = worldToScreen(view, { x: event.cell.x * GRID_SIZE, y: event.cell.y * GRID_SIZE })

        ctx.fillStyle = WARP_FILL
        ctx.fillRect(screen.x, screen.y, size, size)
        ctx.strokeStyle = WARP_STROKE
        ctx.lineWidth = 1
        ctx.strokeRect(screen.x + 0.5, screen.y + 0.5, size - 1, size - 1)
        ctx.fillStyle = WARP_STROKE
        ctx.font = `bold ${Math.max(8, Math.floor(size * 0.6))}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('W', screen.x + size / 2, screen.y + size / 2 + 1)
    }
}
