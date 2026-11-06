import { findMap, isValidMapName, renameMap } from 'domain/project'
import { readProject, writeProject } from 'Server/services/project-store'
import { Request, RequestHandler, Response } from 'Server/types'

/** Body: `{ name }`. Answers the renamed map. */
export const requestHandlerPatchMap: RequestHandler = (request: Request, response: Response): void => {
    const { mapId } = request.params
    const name: unknown = request.body?.name

    if (!isValidMapName(name)) {
        response.status(400).json({ error: 'A map needs a name' })
        return
    }

    const project = readProject()

    if (findMap(project, mapId) === undefined) {
        response.status(404).json({ error: 'Map not found' })
        return
    }

    const renamed = renameMap(project, mapId, name.trim())

    writeProject(renamed)

    response.json(findMap(renamed, mapId))
}
