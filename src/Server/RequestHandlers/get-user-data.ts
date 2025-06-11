import { config } from 'Server/config'
import { readJson } from 'Server/services/read-json'
import { Request, RequestHandler, Response } from 'Server/types'

export const requestHandlerGetUserData: RequestHandler = (request: Request, response: Response): void => {
    response.json(
        readJson(
            config.userDataFileDir
        )
    )
}