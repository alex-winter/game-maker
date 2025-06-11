import { Layer } from 'Model/Layer'
import { config } from 'Server/config'
import { readJson } from 'Server/services/read-json'
import { writeJson } from 'Server/services/write-json'
import { Request, RequestHandler, Response } from 'Server/types'

export const requestHandlerPatchLayers: RequestHandler = (request: Request, response: Response): void => {
    const updatedLayer = request.body as Layer

    const jsonFileDir = config.layersJsonFileDir

    const layers = readJson<Layer[]>(jsonFileDir)
    const layer: undefined | Layer = layers.find(l => l.uuid === updatedLayer.uuid)

    if (layer === undefined) {
        response.status(404).json({ error: 'Layer not found' })
    } else {
        Object.assign(layer, updatedLayer)

        writeJson(jsonFileDir, layers)

        response.json({ ok: true, updatedLayer: layer })
    }
}