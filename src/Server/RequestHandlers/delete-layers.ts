import { Layer } from 'Model/Layer'
import { config } from 'Server/config'
import { readJson } from 'Server/services/read-json'
import { writeJson } from 'Server/services/write-json'
import { RequestHandler, Request, Response } from 'Server/types'

export const requestHandlerDeleteLayers: RequestHandler = (request: Request, response: Response): void => {
    const { uuid } = request.params
    const jsonFileDir = config.layersJsonFileDir
    const layers = readJson<Layer[]>(jsonFileDir)
    const index = layers.findIndex(layer => layer.uuid === uuid)

    if (index === -1) {
        response.status(404).json({ error: 'Layer not found' })
    }

    layers.splice(index, 1)
    writeJson(jsonFileDir, layers)

    response.json({
        ok: true,
        deletedUuid: uuid,
    })
}