import { GRID_SIZE } from 'domain/grid'
import { attributesAt, isSolid, TileMap } from 'domain/map'
import { Tileset } from 'domain/tileset'
import { View, viewRect, worldToScreen } from 'engine/view'

export type AttributeOverlays = {
    readonly collision: boolean

    readonly elevation: boolean

    readonly grass: boolean
}

const PAINTED_SOLID = 'rgba(231, 76, 60, 0.45)'
const METATILE_SOLID = 'rgba(230, 126, 34, 0.3)'
const ELEVATION_TINT = 'rgba(52, 152, 219, 0.25)'
const ELEVATION_TEXT = 'rgba(255, 255, 255, 0.95)'
const GRASS_TINT = 'rgba(39, 174, 96, 0.4)'

/**
 * Draws the attribute grids over the frame: painted collision in red, cells a
 * solid metatile blocks in orange, and non-zero elevation as a tinted cell
 * with its number, tall grass in green. Reads the data only; hiding an overlay changes nothing.
 */
export function drawAttributes(
    ctx: CanvasRenderingContext2D,
    view: View,
    map: TileMap,
    tileset: Tileset | undefined,
    overlays: AttributeOverlays,
): void {
    if (!overlays.collision && !overlays.elevation && !overlays.grass) {
        return
    }

    const visible = viewRect(ctx.canvas, view)
    const minX = Math.max(0, Math.floor(visible.x / GRID_SIZE))
    const minY = Math.max(0, Math.floor(visible.y / GRID_SIZE))
    const maxX = Math.min(map.width, Math.ceil((visible.x + visible.width) / GRID_SIZE))
    const maxY = Math.min(map.height, Math.ceil((visible.y + visible.height) / GRID_SIZE))
    const cellSize = GRID_SIZE * view.zoom
    const emptyTileset: Tileset = { id: '', name: '', metatiles: [] }

    ctx.save()
    ctx.font = `${Math.max(8, Math.floor(cellSize * 0.6))}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    for (let y = minY; y < maxY; y++) {
        for (let x = minX; x < maxX; x++) {
            const cell = { x, y }
            const attributes = attributesAt(map, cell)
            const screen = worldToScreen(view, { x: x * GRID_SIZE, y: y * GRID_SIZE })

            if (overlays.collision) {
                if (attributes.solid) {
                    ctx.fillStyle = PAINTED_SOLID
                    ctx.fillRect(screen.x, screen.y, cellSize, cellSize)
                } else if (isSolid(map, tileset ?? emptyTileset, cell)) {
                    ctx.fillStyle = METATILE_SOLID
                    ctx.fillRect(screen.x, screen.y, cellSize, cellSize)
                }
            }

            if (overlays.grass && attributes.grass) {
                ctx.fillStyle = GRASS_TINT
                ctx.fillRect(screen.x, screen.y, cellSize, cellSize)
            }

            if (overlays.elevation && attributes.elevation !== 0) {
                ctx.fillStyle = ELEVATION_TINT
                ctx.fillRect(screen.x, screen.y, cellSize, cellSize)
                ctx.fillStyle = ELEVATION_TEXT
                ctx.fillText(String(attributes.elevation), screen.x + cellSize / 2, screen.y + cellSize / 2)
            }
        }
    }

    ctx.restore()
}
