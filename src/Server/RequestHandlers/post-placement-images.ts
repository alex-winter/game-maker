import { PlacementImage } from 'Model/Placement'
import { config } from 'Server/config'
import { readJson } from 'Server/services/read-json'
import { writeJson } from 'Server/services/write-json'
import { RequestHandler, Request, Response } from 'Server/types'

export const requestHandlerPostPlacementImages: RequestHandler = (request: Request, response: Response) => {
    const newPlacementImages = request.body as PlacementImage[]

    const jsonFileDir = config.placementImagesJsonFileDir

    const existing = readJson<PlacementImage[]>(jsonFileDir)
    const updated = [
        ...existing,
        ...newPlacementImages,
    ]

    writeJson(jsonFileDir, updated)

    response.json({ ok: true })
}