import { newId } from 'domain/id'
import { isItemInput, Item } from 'domain/item'
import { addItem, findItem, removeItem, withItem } from 'domain/project'
import { readProject, writeProject } from 'Server/services/project-store'
import { Request, RequestHandler, Response } from 'Server/types'

const INVALID = 'An item needs a name and a description (which may be empty)'

function cleaned(body: Omit<Item, 'id'>, id: string): Item {
    return { id, name: body.name.trim(), description: body.description.trim() }
}

/** Body: `{ name, description }`. Answers the stored item with its new id. */
export const requestHandlerPostItems: RequestHandler = (request: Request, response: Response): void => {
    const body: unknown = request.body

    if (!isItemInput(body)) {
        response.status(400).json({ error: INVALID })
        return
    }

    const item = cleaned(body, newId())

    writeProject(addItem(readProject(), item))

    response.json(item)
}

export const requestHandlerPutItem: RequestHandler = (request: Request, response: Response): void => {
    const { itemId } = request.params
    const body: unknown = request.body

    if (!isItemInput(body)) {
        response.status(400).json({ error: INVALID })
        return
    }

    const project = readProject()

    if (findItem(project, itemId) === undefined) {
        response.status(404).json({ error: 'Item not found' })
        return
    }

    const item = cleaned(body, itemId)

    writeProject(withItem(project, item))

    response.json(item)
}

export const requestHandlerDeleteItem: RequestHandler = (request: Request, response: Response): void => {
    const { itemId } = request.params
    const project = readProject()

    if (findItem(project, itemId) === undefined) {
        response.status(404).json({ error: 'Item not found' })
        return
    }

    writeProject(removeItem(project, itemId))

    response.json({ ok: true })
}
