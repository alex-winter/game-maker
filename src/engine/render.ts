import { Coordinates, Rect } from '../domain/coordinates'
import { GRID_SIZE } from '../domain/grid'
import { metatileAt, TileLayer } from '../domain/map'
import { rectsIntersect } from '../domain/rect'
import { Tileset } from '../domain/tileset'
import { DrawPort } from './draw-port'
import { Scene } from './scene'

/** The world rectangle a port shows from `camera`. */
export function viewRect<TImage>(port: DrawPort<TImage>, camera: Coordinates): Rect {
    return { x: camera.x, y: camera.y, width: port.width, height: port.height }
}

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
    camera: Coordinates,
): void {
    const range = visibleCellRange(viewRect(port, camera), scene.tileMap.width, scene.tileMap.height)

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

            port.drawImage(
                sheet,
                metatile.x, metatile.y, metatile.w, metatile.h,
                Math.floor(x * GRID_SIZE - camera.x), Math.floor(y * GRID_SIZE - camera.y), GRID_SIZE, GRID_SIZE,
            )
        }
    }
}

function drawPlacements<TImage>(port: DrawPort<TImage>, scene: Scene<TImage>, camera: Coordinates): void {
    const view = viewRect(port, camera)

    for (const layer of scene.placementLayers) {
        for (const placed of layer.placements) {
            if (!rectsIntersect(view, placed)) {
                continue
            }

            port.drawImage(
                placed.image,
                0, 0, placed.width, placed.height,
                Math.floor(placed.x - camera.x), Math.floor(placed.y - camera.y), placed.width, placed.height,
            )
        }
    }
}

/**
 * Paints one frame: the frozen legacy placements as a background, then the
 * tile layers back to front. Both hosts call this and nothing else draws a map.
 */
export function renderFrame<TImage>(port: DrawPort<TImage>, scene: Scene<TImage>, camera: Coordinates): void {
    port.clear()

    drawPlacements(port, scene, camera)

    if (scene.tileset !== undefined) {
        for (const layer of scene.tileMap.layers) {
            drawTileLayer(port, scene, scene.tileset, layer, camera)
        }
    }
}
