import { Cell } from './coordinates'
import { Id } from './id'
import { GridSize, isInside } from './map'

export type Edge = 'north' | 'south' | 'east' | 'west'

export const EDGES: readonly Edge[] = ['north', 'south', 'east', 'west']

/**
 * A seam from one edge of a map to another map. `offset` is in cells along
 * the edge and is added to this map's coordinate: a north connection with
 * offset 3 lines this map's x=0 up with the other map's x=3. Negative
 * offsets slide the other way.
 */
export type Connection = {
    mapId: Id

    offset: number
}

export type Connections = { [E in Edge]?: Connection }

/** Where an out-of-bounds step lands: another map's cell. */
export type Crossing = {
    readonly mapId: Id

    readonly cell: Cell
}

/** The edge a cell just outside `size` lies beyond, or undefined inside or at a corner. */
export function edgeOf(size: GridSize, cell: Cell): Edge | undefined {
    const horizontal = cell.x >= 0 && cell.x < size.width
    const vertical = cell.y >= 0 && cell.y < size.height

    if (horizontal && cell.y < 0) {
        return 'north'
    }

    if (horizontal && cell.y >= size.height) {
        return 'south'
    }

    if (vertical && cell.x >= size.width) {
        return 'east'
    }

    if (vertical && cell.x < 0) {
        return 'west'
    }

    return undefined
}

/**
 * The destination of a step onto the out-of-bounds cell `to`, or undefined
 * when there is no connection on that edge, the destination map is missing
 * (an authoring error the editor shows), or the landing cell is outside it.
 */
export function crossEdge(
    from: GridSize,
    connections: Connections,
    to: Cell,
    sizeOf: (mapId: Id) => GridSize | undefined,
): Crossing | undefined {
    const edge = edgeOf(from, to)

    if (edge === undefined) {
        return undefined
    }

    const connection = connections[edge]

    if (connection === undefined) {
        return undefined
    }

    const destination = sizeOf(connection.mapId)

    if (destination === undefined) {
        return undefined
    }

    const cell = landingCell(edge, connection.offset, to, destination)

    return isInside(destination, cell) ? { mapId: connection.mapId, cell } : undefined
}

function landingCell(edge: Edge, offset: number, to: Cell, destination: GridSize): Cell {
    switch (edge) {
        case 'north':
            return { x: to.x + offset, y: destination.height - 1 }
        case 'south':
            return { x: to.x + offset, y: 0 }
        case 'east':
            return { x: 0, y: to.y + offset }
        case 'west':
            return { x: destination.width - 1, y: to.y + offset }
    }
}

export function isEdge(value: unknown): value is Edge {
    return EDGES.includes(value as Edge)
}

function isConnection(value: unknown): value is Connection {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const connection = value as { mapId?: unknown; offset?: unknown }

    return typeof connection.mapId === 'string' && Number.isInteger(connection.offset)
}

/** Structural check for the editor's four-edge payload. Unknown keys and malformed entries are refused. */
export function isConnections(value: unknown): value is Connections {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    return Object.entries(value).every(([edge, connection]) => isEdge(edge) && isConnection(connection))
}
