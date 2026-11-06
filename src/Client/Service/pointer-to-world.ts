import { Coordinates } from '../../domain/coordinates'
import { screenToWorld, View } from '../../engine/view'

export type ClientPoint = {
    readonly clientX: number

    readonly clientY: number
}

export type RectOrigin = {
    readonly left: number

    readonly top: number
}

/**
 * Converts a viewport pointer position into a world pixel position.
 * `rect` is the bounding rect of the element the camera is drawn into,
 * so the result is independent of where that element sits in the page.
 * Zoom divides screen pixels into world pixels; this is the one formula.
 */
export function pointerToWorld(
    pointer: ClientPoint,
    rect: RectOrigin,
    view: View,
): Coordinates {
    return screenToWorld(view, { x: pointer.clientX - rect.left, y: pointer.clientY - rect.top })
}
