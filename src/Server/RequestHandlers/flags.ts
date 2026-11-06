import { Flag, isFlagInput } from 'domain/flags'
import { newId } from 'domain/id'
import { addFlag, findFlag, removeFlag, withFlag } from 'domain/project'
import { readProject, writeProject } from 'Server/services/project-store'
import { Request, RequestHandler, Response } from 'Server/types'

const INVALID = 'A flag needs a name'

/** Body: `{ name }`. Answers the stored flag with its new id. */
export const requestHandlerPostFlags: RequestHandler = (request: Request, response: Response): void => {
    const body: unknown = request.body

    if (!isFlagInput(body)) {
        response.status(400).json({ error: INVALID })
        return
    }

    const flag: Flag = { id: newId(), name: body.name.trim() }

    writeProject(addFlag(readProject(), flag))

    response.json(flag)
}

/** Body: `{ name }`. Renames; the id, which events refer to, never changes. */
export const requestHandlerPutFlag: RequestHandler = (request: Request, response: Response): void => {
    const { flagId } = request.params
    const body: unknown = request.body

    if (!isFlagInput(body)) {
        response.status(400).json({ error: INVALID })
        return
    }

    const project = readProject()

    if (findFlag(project, flagId) === undefined) {
        response.status(404).json({ error: 'Flag not found' })
        return
    }

    const flag: Flag = { id: flagId, name: body.name.trim() }

    writeProject(withFlag(project, flag))

    response.json(flag)
}

export const requestHandlerDeleteFlag: RequestHandler = (request: Request, response: Response): void => {
    const { flagId } = request.params
    const project = readProject()

    if (findFlag(project, flagId) === undefined) {
        response.status(404).json({ error: 'Flag not found' })
        return
    }

    writeProject(removeFlag(project, flagId))

    response.json({ ok: true })
}
