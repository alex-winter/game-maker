import { promises as fs } from 'fs'
import path from 'path'
import { UploadedSheet } from 'Model/UploadedSheet'
import { config } from 'Server/config'
import { imageMimeType } from 'Server/services/image-mime'
import { readUploadsIndex } from 'Server/services/uploads-index'
import { Request, Response } from 'Server/types'

/** Files uploaded before the index existed are listed under their stored name. */
function legacySheets(files: string[], indexed: UploadedSheet[]): UploadedSheet[] {
    const known = new Set(indexed.map(sheet => sheet.file))

    return files
        .filter(filename => !known.has(filename))
        .filter(filename => config.allowedExtensions.includes(path.extname(filename).toLowerCase()))
        .map(filename => ({ id: filename, originalName: filename, file: filename }))
}

async function toDataUrl(file: string): Promise<string | undefined> {
    const mimeType = imageMimeType(file)

    if (mimeType === undefined) {
        return undefined
    }

    const bytes = await fs.readFile(path.join(config.uploadsDir, file))

    return `data:${mimeType};base64,${bytes.toString('base64')}`
}

export const requestHandlerGetSheets = async (request: Request, response: Response): Promise<void> => {
    let files: string[]

    try {
        files = await fs.readdir(config.uploadsDir)
    } catch {
        response.status(500).json({ error: 'Failed to read uploads directory' })
        return
    }

    const indexed = readUploadsIndex()
        .filter(sheet => files.includes(sheet.file))

    const sheets = []

    for (const sheet of [...indexed, ...legacySheets(files, indexed)]) {
        const imageSrc = await toDataUrl(sheet.file)

        if (imageSrc !== undefined) {
            sheets.push({
                id: sheet.id,
                name: sheet.originalName,
                file: sheet.file,
                imageSrc,
            })
        }
    }

    response.json(sheets)
}
