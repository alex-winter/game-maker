import { Rect } from '../domain/coordinates'
import { GRID_SIZE } from '../domain/grid'
import { metatileAt, TileLayer } from '../domain/map'
import { rectsIntersect } from '../domain/rect'
import { Tileset } from '../domain/tileset'
import { DrawPort } from './draw-port'
import { Scene } from './scene'
import { View, viewRect, worldToScreen } from './view'

export { viewRect } from './view'

/** The cell range `[min, max)` that overlaps `view`, clamped to the map. */
function visibleCellRange(view: Rect, width: number, height: number) {
    return {
        minX: Math.max(0, Math.floor(view.x / GRID_SIZE)),
        minY: Math.max(0, Math.floor(view.y / GRID_SIZE)),
        maxX: Math.min(width, Math.ceil((view.x + view.width) / GRID_SIZE)),
        maxY: Math.min(height, Math.ceil((view.y + view.height) / GRID_SIZE)),
    }
}

function drawTileLayer<TImage>(
    port: DrawPort<TImage>,
    scene: Scene<TImage>,
    tileset: Tileset,
    layer: TileLayer,
    view: View,
): void {
    const range = visibleCellRange(viewRect(port, view), scene.tileMap.width, scene.tileMap.height)
    const cellSize = GRID_SIZE * view.zoom

    for (let y = range.minY; y < range.maxY; y++) {
        for (let x = range.minX; x < range.maxX; x++) {
            const metatile = metatileAt(scene.tileMap, layer, tileset, { x, y })

            if (metatile === undefined) {
                continue
            }

            const sheet = scene.sheetById.get(metatile.sheetId)

            if (sheet === undefined) {
                continue
            }

            const screen = worldToScreen(view, { x: x * GRID_SIZE, y: y * GRID_SIZE })

            port.drawImage(
                sheet,
                metatile.x, metatile.y, metatile.w, metatile.h,
                screen.x, screen.y, cellSize, cellSize,
            )
        }
    }
}

function drawPlacements<TImage>(port: DrawPort<TImage>, scene: Scene<TImage>, view: View): void {
    const visible = viewRect(port, view)

    for (const layer of scene.placementLayers) {
        for (const placed of layer.placements) {
            if (!rectsIntersect(visible, placed)) {
                continue
            }

            const screen = worldToScreen(view, placed)

            port.drawImage(
                placed.image,
                0, 0, placed.width, placed.height,
                screen.x, screen.y, placed.width * view.zoom, placed.height * view.zoom,
            )
        }
    }
}

/**
 * Paints one frame: the frozen legacy placements as a background, then the
 * tile layers back to front. Both hosts call this and nothing else draws a map.
 */
export function renderFrame<TImage>(port: DrawPort<TImage>, scene: Scene<TImage>, view: View): void {
    port.clear()

    drawPlacements(port, scene, view)

    if (scene.tileset !== undefined) {
        for (const layer of scene.tileMap.layers) {
            drawTileLayer(port, scene, scene.tileset, layer, view)
        }
    }
}
