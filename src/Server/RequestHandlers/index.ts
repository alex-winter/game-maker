import { config } from 'Server/config'
import { Request, Response } from 'Server/types'
import path from 'path'

export const requestHandlerIndex = (request: Request, response: Response) => {
    response.sendFile(
        path.join(config.publicDir, 'index.html')
    )
}