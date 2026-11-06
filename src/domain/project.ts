import type { Layer } from 'Model/Layer'
import { Id, newId } from './id'
import { emptyTileMap, GridSize, TileMap } from './map'
import { Tileset } from './tileset'

/** Cells in a new map. A gen 3 town is about this size. */
export const DEFAULT_MAP_SIZE: GridSize = { width: 20, height: 20 }

/**
 * One place in the game: a town, a route, a house interior. The grid lives
 * in `tileMap`. `layers` is the legacy placement list; `Layer` is a type-only
 * import so `domain` has no runtime dependency on it, and both die with the
 * placement model in T-020.
 */
export type GameMap = {
    readonly id: Id

    name: string

    tileMap: TileMap

    layers: Layer[]
}

/** One game. There is one local project; it owns every map and tileset. */
export type Project = {
    readonly id: Id

    name: string

    tilesets: Tileset[]

    maps: GameMap[]
}

export function newMap(name: string, layers: Layer[] = [], size: GridSize = DEFAULT_MAP_SIZE): GameMap {
    return { id: newId(), name, tileMap: emptyTileMap(size), layers }
}

export function newProject(name: string, maps: GameMap[] = []): Project {
    return { id: newId(), name, tilesets: [], maps }
}

/**
 * Fills fields that an older project file does not have. The file written
 * before T-014 has maps without a `tileMap` and no `tilesets`.
 */
export function withProjectDefaults(stored: Partial<Project> & Pick<Project, 'id' | 'name' | 'maps'>): Project {
    return {
        id: stored.id,
        name: stored.name,
        tilesets: stored.tilesets ?? [],
        maps: stored.maps.map(map => ({
            ...map,
            tileMap: map.tileMap ?? emptyTileMap(DEFAULT_MAP_SIZE),
            layers: map.layers ?? [],
        })),
    }
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

export function findTileset(project: Project, tilesetId: Id): Tileset | undefined {
    return project.tilesets.find(tileset => tileset.id === tilesetId)
}

/** A new project with `tileset` appended. */
export function addTileset(project: Project, tileset: Tileset): Project {
    return { ...project, tilesets: [...project.tilesets, tileset] }
}

/** A new project with one tileset replaced by id, or unchanged when the id is unknown. */
export function withTileset(project: Project, tileset: Tileset): Project {
    return {
        ...project,
        tilesets: project.tilesets.map(existing => existing.id === tileset.id ? tileset : existing),
    }
}

/** A new project with one map's grid replaced. */
export function withMapTileMap(project: Project, mapId: Id, tileMap: TileMap): Project {
    return {
        ...project,
        maps: project.maps.map(map => map.id === mapId ? { ...map, tileMap } : map),
    }
}

/** A new project with one map pointing at a tileset. */
export function withMapTileset(project: Project, mapId: Id, tilesetId: Id | null): Project {
    return {
        ...project,
        maps: project.maps.map(map => map.id === mapId ? { ...map, tileMap: { ...map.tileMap, tilesetId } } : map),
    }
}

/** A trimmed name is valid when something is left of it. */
export function isValidMapName(name: unknown): name is string {
    return typeof name === 'string' && name.trim().length > 0
}
