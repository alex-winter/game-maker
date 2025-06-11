import path from 'path'
import { config } from 'Server/config'
import { Request, Response } from 'Server/types'

export const requestHandlerPlay = (request: Request, response: Response): void => {
    response.sendFile(
        path.join(config.publicDir, 'play.html')
    )
}