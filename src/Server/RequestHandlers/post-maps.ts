import { addMap, isValidMapName, newMap } from 'domain/project'
import { readProject, writeProject } from 'Server/services/project-store'
import { Request, RequestHandler, Response } from 'Server/types'

/** Body: `{ name }`. Answers the created map. */
export const requestHandlerPostMaps: RequestHandler = (request: Request, response: Response): void => {
    const name: unknown = request.body?.name

    if (!isValidMapName(name)) {
        response.status(400).json({ error: 'A map needs a name' })
        return
    }

    const map = newMap(name.trim())

    writeProject(addMap(readProject(), map))

    response.json(map)
}
