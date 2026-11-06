import { isTileMap } from 'domain/map'
import { findMap, findTileset, withMapTileMap } from 'domain/project'
import { readProject, writeProject } from 'Server/services/project-store'
import { Request, RequestHandler, Response } from 'Server/types'

/**
 * Body: a whole `TileMap`. The editor sends one after every stroke and every
 * layer edit; the map is small enough that a full replace is the simple,
 * correct thing. Answers the stored map.
 */
export const requestHandlerPutTileMap: RequestHandler = (request: Request, response: Response): void => {
    const { mapId } = request.params
    const body: unknown = request.body

    if (!isTileMap(body)) {
        response.status(400).json({ error: 'Not a tile map' })
        return
    }

    const project = readProject()
    const map = findMap(project, mapId)

    if (map === undefined) {
        response.status(404).json({ error: 'Map not found' })
        return
    }

    if (body.tilesetId !== null && findTileset(project, body.tilesetId) === undefined) {
        response.status(404).json({ error: 'Tileset not found' })
        return
    }

    const updated = withMapTileMap(project, mapId, body)

    writeProject(updated)

    response.json(findMap(updated, mapId))
}
