import { readProject } from 'Server/services/project-store'
import { Request, RequestHandler, Response } from 'Server/types'

export const requestHandlerGetProject: RequestHandler = (request: Request, response: Response): void => {
    response.json(readProject())
}
