import { Layer } from 'Model/Layer'
import { config } from 'Server/config'
import { isLayerList } from 'Server/services/is-layer-list'
import { readJson } from 'Server/services/read-json'
import { writeJson } from 'Server/services/write-json'
import { Request, RequestHandler, Response } from 'Server/types'

export const requestHandlerPostLayers: RequestHandler = (request: Request, response: Response): void => {
    const body: unknown = request.body

    if (!isLayerList(body)) {
        response.status(400).json({ error: 'Invalid data format' })
        return
    }

    const jsonFileDir = config.layersJsonFileDir

    const existing = readJson<Layer[]>(jsonFileDir)
    const updated = [
        ...existing,
        ...body,
    ]

    writeJson(jsonFileDir, updated)

    response.json({
        ok: true,
        message: 'posted ok',
    })
}
