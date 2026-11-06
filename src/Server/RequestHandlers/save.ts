import fs from 'fs'
import { isSavedSession, parseSave, serializeSave } from 'domain/save'
import { config } from 'Server/config'
import { readJson } from 'Server/services/read-json'
import { writeJson } from 'Server/services/write-json'
import { Request, RequestHandler, Response } from 'Server/types'

/** The whole save document, or 404 when the player has never saved. A file that does not parse is also 404, with its reason logged. */
export const requestHandlerGetSave: RequestHandler = (_request: Request, response: Response): void => {
    if (!fs.existsSync(config.saveFileDir)) {
        response.status(404).json({ error: 'No save' })
        return
    }

    const document: unknown = readJson(config.saveFileDir)
    const parsed = parseSave(document)

    if (!parsed.ok) {
        console.warn('Ignoring an unreadable save:', parsed.reason)
        response.status(404).json({ error: parsed.reason })
        return
    }

    response.json(document)
}

/** Body: a `SavedSession`. Writes the one slot atomically and answers the stored document. */
export const requestHandlerPutSave: RequestHandler = (request: Request, response: Response): void => {
    const body: unknown = request.body

    if (!isSavedSession(body)) {
        response.status(400).json({ error: 'A save needs mapId, cell, facing, memory, and bag' })
        return
    }

    const document = serializeSave(body, new Date().toISOString())

    writeJson(config.saveFileDir, document)

    response.json(document)
}

/** New game: forgets the save. */
export const requestHandlerDeleteSave: RequestHandler = (_request: Request, response: Response): void => {
    if (fs.existsSync(config.saveFileDir)) {
        fs.unlinkSync(config.saveFileDir)
    }

    response.json({ ok: true })
}
