import { Coordinates } from 'Model/Coordinates'

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
 */
export function pointerToWorld(
    pointer: ClientPoint,
    rect: RectOrigin,
    camera: Coordinates,
): Coordinates {
    return {
        x: camera.x + (pointer.clientX - rect.left),
        y: camera.y + (pointer.clientY - rect.top),
    }
}
