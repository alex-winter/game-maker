import { Rect } from '../domain/coordinates'
import { GRID_SIZE } from '../domain/grid'
import { metatileAt, TileLayer, TileLayerKind } from '../domain/map'
import { rectsIntersect } from '../domain/rect'
import { frameAt, Tileset } from '../domain/tileset'
import { DrawPort } from './draw-port'
import { Actor, Scene } from './scene'
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
    timeMs: number,
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
            const source = frameAt(metatile, timeMs)

            port.drawImage(
                sheet,
                source.x, source.y, source.width, source.height,
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

function drawTilePass<TImage>(port: DrawPort<TImage>, scene: Scene<TImage>, kind: TileLayerKind, view: View, timeMs: number): void {
    if (scene.tileset === undefined) {
        return
    }

    for (const layer of scene.tileMap.layers) {
        if (layer.kind === kind) {
            drawTileLayer(port, scene, scene.tileset, layer, view, timeMs)
        }
    }
}

function drawActors<TImage>(port: DrawPort<TImage>, actors: readonly Actor<TImage>[], view: View): void {
    const visible = viewRect(port, view)

    for (const actor of actors) {
        if (!rectsIntersect(visible, actor)) {
            continue
        }

        const screen = worldToScreen(view, actor)
        const width = actor.width * view.zoom
        const height = actor.height * view.zoom

        if (actor.sprite === undefined) {
            port.fillRect(screen.x, screen.y, width, height, actor.color)
        } else {
            port.drawImage(actor.sprite.image, actor.sprite.sx, actor.sprite.sy, actor.sprite.sw, actor.sprite.sh, screen.x, screen.y, width, height)
        }
    }
}

/**
 * Paints one frame in fixed passes: the frozen legacy placements as a
 * background, ground tile layers (in list order), actors, then overhead
 * tile layers. Both hosts call this and nothing else draws a map. `timeMs`
 * is the clock animated tiles follow (T-045); a host that passes nothing
 * draws every tile's first frame.
 */
export function renderFrame<TImage>(
    port: DrawPort<TImage>,
    scene: Scene<TImage>,
    view: View,
    actors: readonly Actor<TImage>[] = [],
    timeMs = 0,
): void {
    port.clear()

    drawPlacements(port, scene, view)
    drawTilePass(port, scene, 'ground', view, timeMs)
    drawActors(port, actors, view)
    drawTilePass(port, scene, 'overhead', view, timeMs)
}
