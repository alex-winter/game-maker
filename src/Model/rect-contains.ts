import { Coordinates, Rect } from 'Model/Coordinates'

/** True when `point` lies inside `[x, x + width) × [y, y + height)`. */
export function rectContainsPoint(rect: Rect, point: Coordinates): boolean {
    return point.x >= rect.x
        && point.x < rect.x + rect.width
        && point.y >= rect.y
        && point.y < rect.y + rect.height
}
