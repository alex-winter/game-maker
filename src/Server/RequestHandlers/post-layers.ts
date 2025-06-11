import { Layer } from 'Model/Layer'
import { config } from 'Server/config'
import { readJson } from 'Server/services/read-json'
import { writeJson } from 'Server/services/write-json'
import { Request, RequestHandler, Response } from 'Server/types'

export const requestHandlerPostLayers: RequestHandler = (request: Request, response: Response): void => {
    if (!Array.isArray(request.body)) {
        response.status(400).json({ error: 'Invalid data format' })
    }

    const jsonFileDir = config.layersJsonFileDir

    const existing = readJson<Layer[]>(jsonFileDir)
    const updated = [
        ...existing,
        ...request.body,
    ]

    writeJson(jsonFileDir, updated)

    response.json({
        ok: true,
        message: 'posted ok',
    })
}