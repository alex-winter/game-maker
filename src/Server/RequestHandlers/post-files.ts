import path from 'path'
import { UploadedSheet } from 'Model/UploadedSheet'
import { config } from 'Server/config'
import { readJson } from 'Server/services/read-json'
import { writeJson } from 'Server/services/write-json'
import { RequestHandler, Request, Response } from 'Server/types'

function toUploadedSheet(file: Express.Multer.File): UploadedSheet {
    return {
        id: path.parse(file.filename).name,
        originalName: file.originalname,
        file: file.filename,
    }
}

export const requestHandlerPostFiles: RequestHandler = (request: Request, response: Response): void => {
    const files = Array.isArray(request.files) ? request.files : []
    const uploaded = files.map(toUploadedSheet)

    const indexFile = config.uploadsIndexFileDir
    const existing = readJson<UploadedSheet[]>(indexFile)

    writeJson(indexFile, [...existing, ...uploaded])

    response.json({
        message: 'Files uploaded successfully!',
        files: uploaded.map(sheet => ({
            id: sheet.id,
            originalName: sheet.originalName,
            savedAs: sheet.file,
        })),
    })
}
