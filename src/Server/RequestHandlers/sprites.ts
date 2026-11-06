import { newId } from 'domain/id'
import { addSprite, findSprite, removeSprite, withPlayerSprite, withSprite } from 'domain/project'
import { isSpriteDefinitionInput, SpriteDefinition } from 'domain/sprite'
import { readProject, writeProject } from 'Server/services/project-store'
import { Request, RequestHandler, Response } from 'Server/types'

const INVALID = 'A sprite needs a name, sheetId, positive frame size, and idle plus walk frames for all four directions'

/** Body: a definition without an id. Answers the stored sprite. */
export const requestHandlerPostSprites: RequestHandler = (request: Request, response: Response): void => {
    const body: unknown = request.body

    if (!isSpriteDefinitionInput(body)) {
        response.status(400).json({ error: INVALID })
        return
    }

    const sprite: SpriteDefinition = { ...body, id: newId(), name: body.name.trim() }

    writeProject(addSprite(readProject(), sprite))

    response.json(sprite)
}

/** Body: the whole definition. The id in the path wins over any in the body. Answers the stored sprite. */
export const requestHandlerPutSprite: RequestHandler = (request: Request, response: Response): void => {
    const { spriteId } = request.params
    const body: unknown = request.body

    if (!isSpriteDefinitionInput(body)) {
        response.status(400).json({ error: INVALID })
        return
    }

    const project = readProject()

    if (findSprite(project, spriteId) === undefined) {
        response.status(404).json({ error: 'Sprite not found' })
        return
    }

    const sprite: SpriteDefinition = { ...body, id: spriteId, name: body.name.trim() }

    writeProject(withSprite(project, sprite))

    response.json(sprite)
}

export const requestHandlerDeleteSprite: RequestHandler = (request: Request, response: Response): void => {
    const { spriteId } = request.params
    const project = readProject()

    if (findSprite(project, spriteId) === undefined) {
        response.status(404).json({ error: 'Sprite not found' })
        return
    }

    writeProject(removeSprite(project, spriteId))

    response.json({ ok: true })
}

/** Body: `{ spriteId }` (or null). Answers `{ playerSpriteId }`. */
export const requestHandlerPutPlayerSprite: RequestHandler = (request: Request, response: Response): void => {
    const spriteId: unknown = request.body?.spriteId

    if (spriteId !== null && typeof spriteId !== 'string') {
        response.status(400).json({ error: 'spriteId must be a string or null' })
        return
    }

    const project = readProject()

    if (spriteId !== null && findSprite(project, spriteId) === undefined) {
        response.status(404).json({ error: 'Sprite not found' })
        return
    }

    const updated = withPlayerSprite(project, spriteId)

    writeProject(updated)

    response.json({ playerSpriteId: updated.playerSpriteId })
}
