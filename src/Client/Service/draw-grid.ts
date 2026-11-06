import { GRID_SIZE } from 'domain/grid'
import { GridSize } from 'domain/map'
import { View, worldToScreen } from 'engine/view'

/**
 * Strokes the 16×16 cell borders of the map over whatever the engine drew,
 * plus a brighter outline around the map's edge. Lines sit on the half pixel
 * so they are one device pixel wide at every zoom.
 */
export function drawGrid(ctx: CanvasRenderingContext2D, view: View, map: GridSize): void {
    const origin = worldToScreen(view, { x: 0, y: 0 })
    const end = worldToScreen(view, { x: map.width * GRID_SIZE, y: map.height * GRID_SIZE })
    const cell = GRID_SIZE * view.zoom

    const left = Math.max(0, origin.x)
    const top = Math.max(0, origin.y)
    const right = Math.min(ctx.canvas.width, end.x)
    const bottom = Math.min(ctx.canvas.height, end.y)

    if (right <= left || bottom <= top) {
        return
    }

    ctx.save()
    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)'
    ctx.beginPath()

    const firstColumn = Math.ceil((left - origin.x) / cell)
    const lastColumn = Math.floor((right - origin.x) / cell)

    for (let column = firstColumn; column <= lastColumn; column++) {
        const x = origin.x + column * cell + 0.5

        ctx.moveTo(x, top)
        ctx.lineTo(x, bottom)
    }

    const firstRow = Math.ceil((top - origin.y) / cell)
    const lastRow = Math.floor((bottom - origin.y) / cell)

    for (let row = firstRow; row <= lastRow; row++) {
        const y = origin.y + row * cell + 0.5

        ctx.moveTo(left, y)
        ctx.lineTo(right, y)
    }

    ctx.stroke()

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.strokeRect(origin.x + 0.5, origin.y + 0.5, end.x - origin.x, end.y - origin.y)
    ctx.restore()
}
