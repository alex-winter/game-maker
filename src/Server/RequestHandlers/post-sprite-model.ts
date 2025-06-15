import { SpriteModel } from 'Model/SpriteModel'
import { config } from 'Server/config'
import { readJson } from 'Server/services/read-json'
import { writeJson } from 'Server/services/write-json'
import { RequestHandler, Request, Response } from 'Server/types'

export const requestHandlerPostSpriteModel: RequestHandler = (request: Request, response: Response) => {
    const newOnes = request.body as SpriteModel[]

    const jsonFileDir = config.spriteModelsJsonFileDir

    const existing = readJson<SpriteModel[]>(jsonFileDir)
    const updated = [
        ...existing,
        ...newOnes,
    ]

    writeJson(jsonFileDir, updated)

    response.json({ ok: true })
}