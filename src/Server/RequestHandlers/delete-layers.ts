import { findMap, withMapLayers } from 'domain/project'
import { readProject, writeProject } from 'Server/services/project-store'
import { RequestHandler, Request, Response } from 'Server/types'

export const requestHandlerDeleteLayers: RequestHandler = (request: Request, response: Response): void => {
    const { mapId, uuid } = request.params
    const project = readProject()
    const map = findMap(project, mapId)

    if (map === undefined) {
        response.status(404).json({ error: 'Map not found' })
        return
    }

    if (!map.layers.some(layer => layer.uuid === uuid)) {
        response.status(404).json({ error: 'Layer not found' })
        return
    }

    writeProject(
        withMapLayers(project, map.id, map.layers.filter(layer => layer.uuid !== uuid))
    )

    response.json({
        ok: true,
        deletedUuid: uuid,
    })
}
