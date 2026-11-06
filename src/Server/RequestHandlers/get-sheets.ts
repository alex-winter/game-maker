import fs from 'fs'
import path from 'path'
import { UploadedSheet } from 'Model/UploadedSheet'
import { config } from 'Server/config'
import { readJson } from 'Server/services/read-json'
import { Request, Response } from 'Server/types'

/** Files uploaded before the index existed are listed under their stored name. */
function legacySheets(files: string[], indexed: UploadedSheet[]): UploadedSheet[] {
    const known = new Set(indexed.map(sheet => sheet.file))

    return files
        .filter(filename => !known.has(filename))
        .filter(filename => config.allowedExtensions.includes(path.extname(filename).toLowerCase()))
        .map(filename => ({ id: filename, originalName: filename, file: filename }))
}

export const requestHandlerGetSheets = (request: Request, response: Response) => {
    const uploadsDir = config.uploadsDir

    fs.readdir(
        uploadsDir,
        (error, files) => {
            if (error) {
                return response.status(500).json({ error: 'Failed to read uploads directory' })
            }

            const indexed = readJson<UploadedSheet[]>(config.uploadsIndexFileDir)
                .filter(sheet => files.includes(sheet.file))

            const sheets = [...indexed, ...legacySheets(files, indexed)]
                .map(sheet => {
                    const fileData = fs.readFileSync(path.join(uploadsDir, sheet.file))
                    const base64Image = `data:image/${path.extname(sheet.file).slice(1)};base64,${fileData.toString('base64')}`

                    return {
                        id: sheet.id,
                        name: sheet.originalName,
                        file: sheet.file,
                        imageSrc: base64Image,
                    }
                })

            response.json(sheets)
        }
    )
}
