import fs from 'fs'
import path from 'path'
import { config } from 'Server/config'
import { Request, Response } from 'Server/types'

export const requestHandlerGetSheets = (request: Request, response: Response) => {
    const uploadsDir = config.uploadsDir

    fs.readdir(
        uploadsDir,
        (error, files) => {
            if (error) {
                return response.status(500).json({ error: 'Failed to read uploads directory' })
            }

            const sheets = files
                .filter((filename: string) => {
                    const ext = path.extname(filename).toLowerCase()
                    return config.allowedExtensions.includes(ext)
                })
                .map((filename: string) => {
                    const filePath = path.join(uploadsDir, filename)
                    const fileData = fs.readFileSync(filePath)
                    const base64Image = `data:image/${path.extname(filename).slice(1)};base64,${fileData.toString('base64')}`

                    return {
                        name: filename,
                        imageSrc: base64Image,
                    }
                })

            response.json(sheets)
        }
    )
}