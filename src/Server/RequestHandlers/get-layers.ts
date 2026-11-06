import { findMap } from 'domain/project'
import { readProject } from 'Server/services/project-store'
import { Request, RequestHandler, Response } from 'Server/types'

export const requestHandlerGetLayers: RequestHandler = (request: Request, response: Response): void => {
    const map = findMap(readProject(), request.params.mapId)

    if (map === undefined) {
        response.status(404).json({ error: 'Map not found' })
        return
    }

    response.json(map.layers)
}
