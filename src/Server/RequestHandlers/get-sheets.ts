import { promises as fs } from 'fs'
import path from 'path'
import { assetUrl } from 'domain/asset-url'
import { UploadedSheet } from 'Model/UploadedSheet'
import { config } from 'Server/config'
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

/** Ids, names, and URLs only. The bytes come from `GET /assets/:file`. */
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

    const sheets = [...indexed, ...legacySheets(files, indexed)].map(sheet => ({
        id: sheet.id,
        name: sheet.originalName,
        file: sheet.file,
        imageSrc: assetUrl(sheet.file),
    }))

    response.json(sheets)
}
