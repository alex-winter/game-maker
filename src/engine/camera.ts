import { Coordinates } from '../domain/coordinates'
import { PortSize } from './draw-port'

/** The gen 3 screen in world pixels: 15 × 10 cells. */
export const GBA_VIEW: PortSize = { width: 240, height: 160 }

/** The largest whole-number scale at which `view` fits inside `window`, never below 1. */
export function integerScale(window: PortSize, view: PortSize = GBA_VIEW): number {
    return Math.max(1, Math.floor(Math.min(window.width / view.width, window.height / view.height)))
}

/**
 * The world pixel at the top-left of a view that keeps `focus` centred,
 * clamped so the view never shows past the map edge. On an axis where the
 * map is smaller than the view, the map is centred instead. Whole pixels,
 * so the tiles never shimmer.
 */
export function cameraFor(focus: Coordinates, view: PortSize, mapPixels: PortSize): Coordinates {
    return {
        x: axis(focus.x, view.width, mapPixels.width),
        y: axis(focus.y, view.height, mapPixels.height),
    }
}

function axis(focus: number, viewLength: number, mapLength: number): number {
    if (mapLength <= viewLength) {
        return Math.round((mapLength - viewLength) / 2)
    }

    const centred = Math.round(focus - viewLength / 2)

    return Math.min(mapLength - viewLength, Math.max(0, centred))
}
