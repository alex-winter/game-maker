import { isValidGridSize, resizeTileMap } from 'domain/map'
import { findMap, removeMap, withMapTileMap, withStartMap } from 'domain/project'
import { readProject, writeProject } from 'Server/services/project-store'
import { Request, RequestHandler, Response } from 'Server/types'

/** Removes one map. Removing the last map is allowed; the editor shows an empty state. */
export const requestHandlerDeleteMap: RequestHandler = (request: Request, response: Response): void => {
    const { mapId } = request.params
    const project = readProject()

    if (findMap(project, mapId) === undefined) {
        response.status(404).json({ error: 'Map not found' })
        return
    }

    writeProject(removeMap(project, mapId))

    response.json({ ok: true })
}

/** Body: `{ width, height }` in cells. Overlapping cells keep their ids; new cells are empty. Answers the map. */
export const requestHandlerPutMapSize: RequestHandler = (request: Request, response: Response): void => {
    const { mapId } = request.params
    const size: unknown = request.body

    if (!isValidGridSize(size)) {
        response.status(400).json({ error: 'width and height must be integers from 1 to 256' })
        return
    }

    const project = readProject()
    const map = findMap(project, mapId)

    if (map === undefined) {
        response.status(404).json({ error: 'Map not found' })
        return
    }

    const resized = withMapTileMap(project, mapId, resizeTileMap(map.tileMap, size))

    writeProject(resized)

    response.json(findMap(resized, mapId))
}

/** Body: `{ mapId }` (or null). Answers `{ startMapId }`. */
export const requestHandlerPutStartMap: RequestHandler = (request: Request, response: Response): void => {
    const mapId: unknown = request.body?.mapId

    if (mapId !== null && typeof mapId !== 'string') {
        response.status(400).json({ error: 'mapId must be a string or null' })
        return
    }

    const project = readProject()

    if (mapId !== null && findMap(project, mapId) === undefined) {
        response.status(404).json({ error: 'Map not found' })
        return
    }

    const updated = withStartMap(project, mapId)

    writeProject(updated)

    response.json({ startMapId: updated.startMapId })
}
