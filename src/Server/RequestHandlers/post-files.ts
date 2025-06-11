import { RequestHandler, Request, Response } from 'Server/types'

export const requestHandlerPostFiles: RequestHandler = (request: Request, response: Response): void => {
    const files = request.files as unknown as Express.Multer.File[]

    response.json({
        message: 'Files uploaded successfully!',
        files: files.map(file => ({
            originalName: file.originalname,
            savedAs: file.filename,
            path: file.path,
        }))
    })
}