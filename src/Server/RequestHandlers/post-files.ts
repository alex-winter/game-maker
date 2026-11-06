import fs from 'fs'
import path from 'path'
import { UploadedSheet } from 'Model/UploadedSheet'
import { appendToUploadsIndex } from 'Server/services/uploads-index'
import { RequestHandler, Request, Response } from 'Server/types'

function toUploadedSheet(file: Express.Multer.File): UploadedSheet {
    return {
        id: path.parse(file.filename).name,
        originalName: file.originalname,
        file: file.filename,
    }
}

function discard(files: Express.Multer.File[]): void {
    for (const file of files) {
        fs.rmSync(file.path, { force: true })
    }
}

export const requestHandlerPostFiles: RequestHandler = (request: Request, response: Response): void => {
    const files = Array.isArray(request.files) ? request.files : []

    if (files.length === 0) {
        response.status(400).json({ error: 'No files were uploaded' })
        return
    }

    const empty = files.filter(file => file.size === 0)

    if (empty.length > 0) {
        discard(files)
        response.status(400).json({
            error: 'Empty files are not accepted',
            files: empty.map(file => file.originalname),
        })
        return
    }

    const uploaded = files.map(toUploadedSheet)

    appendToUploadsIndex(uploaded)

    response.json({
        message: 'Files uploaded successfully!',
        files: uploaded.map(sheet => ({
            id: sheet.id,
            originalName: sheet.originalName,
            savedAs: sheet.file,
        })),
    })
}
