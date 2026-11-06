import { Id } from 'domain/id'
import { Project } from 'domain/project'

export const MAP_QUERY_PARAM = 'map'

/**
 * The map a page should open: the `?map=<id>` it was asked for when that
 * map exists, else the project's first map. Undefined only for a project
 * with no maps.
 */
export function activeMapId(search: string, project: Project): Id | undefined {
    const requested = new URLSearchParams(search).get(MAP_QUERY_PARAM)

    if (requested !== null && project.maps.some(map => map.id === requested)) {
        return requested
    }

    return project.maps[0]?.id
}

/** The same page, pointed at another map. */
export function urlForMap(pathname: string, mapId: Id): string {
    const params = new URLSearchParams()

    params.set(MAP_QUERY_PARAM, mapId)

    return `${pathname}?${params.toString()}`
}
