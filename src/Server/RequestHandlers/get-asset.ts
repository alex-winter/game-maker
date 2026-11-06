import path from 'path'
import { config } from 'Server/config'
import { allowedExtension } from 'Server/services/allowed-extension'
import { Request, RequestHandler, Response } from 'Server/types'

/**
 * Serves one stored sheet by its stored filename. Only a bare filename with
 * an allow-listed image extension is accepted, so `index.json` and anything
 * with a path separator never leave the uploads directory.
 */
export const requestHandlerGetAsset: RequestHandler = (request: Request, response: Response): void => {
    const file: string = request.params.file

    if (path.basename(file) !== file || allowedExtension(file, config.allowedExtensions) === undefined) {
        response.status(404).json({ error: 'Asset not found' })
        return
    }

    response.sendFile(path.join(config.uploadsDir, file), error => {
        if (error && !response.headersSent) {
            response.status(404).json({ error: 'Asset not found' })
        }
    })
}
