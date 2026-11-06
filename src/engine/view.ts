import { Coordinates, Rect } from '../domain/coordinates'
import { PortSize } from './draw-port'

/**
 * Where the camera is and how big a world pixel is on screen. `x`/`y` are
 * the world pixel at the port's top-left; `zoom` is an integer so pixels
 * stay square and crisp with smoothing off.
 */
export type View = Coordinates & {
    readonly zoom: number
}

export const MIN_ZOOM = 1

export const MAX_ZOOM = 4

export function clampZoom(zoom: number): number {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(zoom)))
}

/** The world rectangle a port shows from `view`. */
export function viewRect(port: PortSize, view: View): Rect {
    return { x: view.x, y: view.y, width: port.width / view.zoom, height: port.height / view.zoom }
}

/** World pixel → screen pixel, floored so a draw never lands between device pixels. */
export function worldToScreen(view: View, world: Coordinates): Coordinates {
    return {
        x: Math.floor((world.x - view.x) * view.zoom),
        y: Math.floor((world.y - view.y) * view.zoom),
    }
}

/** Screen pixel (relative to the port's top-left) → world pixel. */
export function screenToWorld(view: View, screen: Coordinates): Coordinates {
    return {
        x: view.x + screen.x / view.zoom,
        y: view.y + screen.y / view.zoom,
    }
}

/**
 * The view after changing zoom while keeping the world point under `anchor`
 * (a screen pixel) in place, so zooming with the wheel zooms toward the cursor.
 */
export function zoomedAt(view: View, zoom: number, anchor: Coordinates): View {
    const next = clampZoom(zoom)
    const world = screenToWorld(view, anchor)

    return {
        x: world.x - anchor.x / next,
        y: world.y - anchor.y / next,
        zoom: next,
    }
}
