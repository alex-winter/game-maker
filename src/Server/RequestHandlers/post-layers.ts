import { findMap, withMapLayers } from 'domain/project'
import { isLayerList } from 'Server/services/is-layer-list'
import { readProject, writeProject } from 'Server/services/project-store'
import { Request, RequestHandler, Response } from 'Server/types'

export const requestHandlerPostLayers: RequestHandler = (request: Request, response: Response): void => {
    const body: unknown = request.body

    if (!isLayerList(body)) {
        response.status(400).json({ error: 'Invalid data format' })
        return
    }

    const project = readProject()
    const map = findMap(project, request.params.mapId)

    if (map === undefined) {
        response.status(404).json({ error: 'Map not found' })
        return
    }

    writeProject(
        withMapLayers(project, map.id, [...map.layers, ...body])
    )

    response.json({
        ok: true,
        message: 'posted ok',
    })
}
