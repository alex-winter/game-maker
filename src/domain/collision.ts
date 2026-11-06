import { Cell } from './coordinates'
import { cellIndex, elevationAt, elevationsAgree, isSolid, metatilesAt, TileMap } from './map'
import { CanEnter, Direction, DIRECTION_DELTAS } from './movement'
import { LedgeDirection, Tileset } from './tileset'

export const OPPOSITE: { readonly [D in Direction]: Direction } = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left',
}

/** The direction of a one-cell step, or undefined when the cells are not neighbours. */
export function directionBetween(from: Cell, to: Cell): Direction | undefined {
    const dx = to.x - from.x
    const dy = to.y - from.y

    for (const direction of Object.keys(DIRECTION_DELTAS) as Direction[]) {
        const delta = DIRECTION_DELTAS[direction]

        if (delta.x === dx && delta.y === dy) {
            return direction
        }
    }

    return undefined
}

/** The ledge on a cell: the painted attribute when set, else the front-most metatile's ledge, else null. */
export function ledgeAt(map: TileMap, tileset: Tileset, cell: Cell): LedgeDirection | null {
    const index = cellIndex(map, cell)

    if (index === undefined) {
        return null
    }

    const painted = map.attributes.ledge[index] ?? null

    if (painted !== null) {
        return painted
    }

    const stacked = metatilesAt(map, tileset, cell)

    return stacked.length === 0 ? null : stacked[stacked.length - 1].ledge
}

/**
 * Whether the player may step from `from` onto the neighbouring `to`.
 *
 * - Outside the map or a solid cell: never.
 * - A ledge is one-way. Its direction is the way you hop it: you may enter
 *   a ledge cell only while moving in that direction, and you may not leave
 *   it against that direction. Any other approach is a wall.
 * - Two non-zero elevations that differ block, except across a ledge taken
 *   the right way, which is how you get down a level.
 */
export function canStep(map: TileMap, tileset: Tileset, from: Cell, to: Cell): boolean {
    const direction = directionBetween(from, to)

    if (direction === undefined || isSolid(map, tileset, to)) {
        return false
    }

    const ledgeAhead = ledgeAt(map, tileset, to)
    const ledgeHere = ledgeAt(map, tileset, from)

    if (ledgeAhead !== null && ledgeAhead !== direction) {
        return false
    }

    if (ledgeHere !== null && OPPOSITE[ledgeHere] === direction) {
        return false
    }

    const hopping = ledgeAhead === direction || ledgeHere === direction

    return hopping || elevationsAgree(elevationAt(map, tileset, from), elevationAt(map, tileset, to))
}

/** `canStep` bound to one map, in the shape `stepPlayer` takes. */
export const stepRule = (map: TileMap, tileset: Tileset): CanEnter => (from, to) => canStep(map, tileset, from, to)
