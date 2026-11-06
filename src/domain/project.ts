import type { Layer } from 'Model/Layer'
import { Id, newId } from './id'

/**
 * One place in the game: a town, a route, a house interior.
 * Until T-014 a map is the legacy placement layer list under a name.
 * `Layer` is a type-only import; it leaves `domain` free of runtime
 * dependencies and dies with the placement model in T-020.
 */
export type GameMap = {
    readonly id: Id

    name: string

    layers: Layer[]
}

/** One game. There is one local project; it owns every map. */
export type Project = {
    readonly id: Id

    name: string

    maps: GameMap[]
}

export function newMap(name: string, layers: Layer[] = []): GameMap {
    return { id: newId(), name, layers }
}

export function newProject(name: string, maps: GameMap[] = []): Project {
    return { id: newId(), name, maps }
}

/** The project the editor opens when there is no file yet: one empty map to paint on. */
export function defaultProject(): Project {
    return newProject('Untitled project', [newMap('Map 1')])
}

/** Wraps a pre-project `layers.json` in a project so the paintings survive. */
export function projectFromLegacyLayers(layers: Layer[]): Project {
    return newProject('Untitled project', [newMap('Legacy map', layers)])
}

export function findMap(project: Project, mapId: Id): GameMap | undefined {
    return project.maps.find(map => map.id === mapId)
}

/** A new project with `map` appended. The input is not mutated. */
export function addMap(project: Project, map: GameMap): Project {
    return { ...project, maps: [...project.maps, map] }
}

/** A new project with one map renamed, or the same maps when `mapId` is unknown. */
export function renameMap(project: Project, mapId: Id, name: string): Project {
    return {
        ...project,
        maps: project.maps.map(map => map.id === mapId ? { ...map, name } : map),
    }
}

/** A new project with one map's layers replaced, or the same maps when `mapId` is unknown. */
export function withMapLayers(project: Project, mapId: Id, layers: Layer[]): Project {
    return {
        ...project,
        maps: project.maps.map(map => map.id === mapId ? { ...map, layers } : map),
    }
}

/** A trimmed name is valid when something is left of it. */
export function isValidMapName(name: unknown): name is string {
    return typeof name === 'string' && name.trim().length > 0
}
