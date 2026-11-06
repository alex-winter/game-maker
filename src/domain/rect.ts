import { Coordinates, Rect } from './coordinates'

/** True when `point` lies inside `[x, x + width) × [y, y + height)`. */
export function rectContainsPoint(rect: Rect, point: Coordinates): boolean {
    return point.x >= rect.x
        && point.x < rect.x + rect.width
        && point.y >= rect.y
        && point.y < rect.y + rect.height
}

/** True when the two half-open rectangles share at least one point. */
export function rectsIntersect(a: Rect, b: Rect): boolean {
    return a.x < b.x + b.width
        && b.x < a.x + a.width
        && a.y < b.y + b.height
        && b.y < a.y + a.height
}
