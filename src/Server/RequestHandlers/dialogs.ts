import { Dialog, isDialogInput } from 'domain/dialog'
import { newId } from 'domain/id'
import { addDialog, findDialog, removeDialog, withDialog } from 'domain/project'
import { readProject, writeProject } from 'Server/services/project-store'
import { Request, RequestHandler, Response } from 'Server/types'

const INVALID = 'A dialog needs a name and at least one page of text'

function cleaned(body: Omit<Dialog, 'id'>, id: string): Dialog {
    return { id, name: body.name.trim(), pages: body.pages.map(page => page.trim()) }
}

/** Body: `{ name, pages }`. Answers the stored dialog with its new id. */
export const requestHandlerPostDialogs: RequestHandler = (request: Request, response: Response): void => {
    const body: unknown = request.body

    if (!isDialogInput(body)) {
        response.status(400).json({ error: INVALID })
        return
    }

    const dialog = cleaned(body, newId())

    writeProject(addDialog(readProject(), dialog))

    response.json(dialog)
}

/** Body: `{ name, pages }`. The id in the path wins over any in the body. */
export const requestHandlerPutDialog: RequestHandler = (request: Request, response: Response): void => {
    const { dialogId } = request.params
    const body: unknown = request.body

    if (!isDialogInput(body)) {
        response.status(400).json({ error: INVALID })
        return
    }

    const project = readProject()

    if (findDialog(project, dialogId) === undefined) {
        response.status(404).json({ error: 'Dialog not found' })
        return
    }

    const dialog = cleaned(body, dialogId)

    writeProject(withDialog(project, dialog))

    response.json(dialog)
}

/** Signs that pointed at the dialog keep their id and say so in play until the author re-points them. */
export const requestHandlerDeleteDialog: RequestHandler = (request: Request, response: Response): void => {
    const { dialogId } = request.params
    const project = readProject()

    if (findDialog(project, dialogId) === undefined) {
        response.status(404).json({ error: 'Dialog not found' })
        return
    }

    writeProject(removeDialog(project, dialogId))

    response.json({ ok: true })
}
