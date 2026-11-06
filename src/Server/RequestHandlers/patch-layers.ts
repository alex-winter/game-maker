import { findMap, withMapLayers } from 'domain/project'
import { Layer } from 'Model/Layer'
import { readProject, writeProject } from 'Server/services/project-store'
import { Request, RequestHandler, Response } from 'Server/types'

function hasUuid(value: unknown): value is Pick<Layer, 'uuid'> & Partial<Layer> {
    return typeof value === 'object'
        && value !== null
        && typeof (value as { uuid?: unknown }).uuid === 'string'
}

export const requestHandlerPatchLayers: RequestHandler = (request: Request, response: Response): void => {
    const updatedLayer: unknown = request.body

    if (!hasUuid(updatedLayer)) {
        response.status(400).json({ error: 'Invalid data format' })
        return
    }

    const project = readProject()
    const map = findMap(project, request.params.mapId)

    if (map === undefined) {
        response.status(404).json({ error: 'Map not found' })
        return
    }

    const layer = map.layers.find(l => l.uuid === updatedLayer.uuid)

    if (layer === undefined) {
        response.status(404).json({ error: 'Layer not found' })
        return
    }

    const merged: Layer = { ...layer, ...updatedLayer }

    writeProject(
        withMapLayers(project, map.id, map.layers.map(l => l.uuid === merged.uuid ? merged : l))
    )

    response.json({ ok: true, updatedLayer: merged })
}
