import { config } from 'Server/config'
import { readJson } from 'Server/services/read-json'
import { Request, Response } from 'Server/types'

export const requestHandlerGetLayers = (request: Request, response: Response): void => {
    response.json(
        readJson(
            config.layersJsonFileDir
        )
    )
}