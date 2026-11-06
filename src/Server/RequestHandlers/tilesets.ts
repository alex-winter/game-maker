import { newId } from 'domain/id'
import { addTileset, findMap, findTileset, withMapTileset, withTileset } from 'domain/project'
import { isMetatileAttributes, isTilesetInput, metatileById, Tileset, withMetatileAttributes } from 'domain/tileset'
import { readProject, writeProject } from 'Server/services/project-store'
import { Request, RequestHandler, Response } from 'Server/types'

/** Body: `{ name, metatiles }`, sliced by the client that knows the image size. Answers the stored tileset. */
export const requestHandlerPostTilesets: RequestHandler = (request: Request, response: Response): void => {
    const body: unknown = request.body

    if (!isTilesetInput(body)) {
        response.status(400).json({ error: 'A tileset needs a name and metatiles' })
        return
    }

    const tileset: Tileset = { id: newId(), name: body.name.trim(), metatiles: body.metatiles }

    writeProject(addTileset(readProject(), tileset))

    response.json(tileset)
}

/** Body: any of `{ solid, elevation, ledge }`. Answers the updated metatile. */
export const requestHandlerPatchMetatile: RequestHandler = (request: Request, response: Response): void => {
    const { tilesetId } = request.params
    const metatileId = Number(request.params.metatileId)
    const body: unknown = request.body

    if (!isMetatileAttributes(body)) {
        response.status(400).json({ error: 'Only solid, elevation, and ledge can be set' })
        return
    }

    const project = readProject()
    const tileset = findTileset(project, tilesetId)

    if (tileset === undefined) {
        response.status(404).json({ error: 'Tileset not found' })
        return
    }

    if (metatileById(tileset, metatileId) === undefined) {
        response.status(404).json({ error: 'Metatile not found' })
        return
    }

    const updated = withMetatileAttributes(tileset, metatileId, body)

    writeProject(withTileset(project, updated))

    response.json(metatileById(updated, metatileId))
}

/** Body: `{ tilesetId }` (or null). Answers the map. */
export const requestHandlerPutMapTileset: RequestHandler = (request: Request, response: Response): void => {
    const { mapId } = request.params
    const tilesetId: unknown = request.body?.tilesetId

    if (tilesetId !== null && typeof tilesetId !== 'string') {
        response.status(400).json({ error: 'tilesetId must be a string or null' })
        return
    }

    const project = readProject()

    if (findMap(project, mapId) === undefined) {
        response.status(404).json({ error: 'Map not found' })
        return
    }

    if (tilesetId !== null && findTileset(project, tilesetId) === undefined) {
        response.status(404).json({ error: 'Tileset not found' })
        return
    }

    const updated = withMapTileset(project, mapId, tilesetId)

    writeProject(updated)

    response.json(findMap(updated, mapId))
}
