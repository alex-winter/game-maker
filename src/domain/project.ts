import type { Layer } from 'Model/Layer'
import { Connections } from './connection'
import { Cell, isCell } from './coordinates'
import { Id, newId } from './id'
import { emptyTileMap, GridSize, isInside, TileMap, withTileMapDefaults } from './map'
import { SpriteDefinition } from './sprite'
import type { MapEvent } from './warp'
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

    /** Where play mode puts the player when it starts on this map. */
    spawn: Cell

    /** Seams to neighbouring maps by edge (T-031). */
    connections: Connections

    /** Warps and, later, other things placed on cells (T-032). */
    events: MapEvent[]

    layers: Layer[]
}

/** One game. There is one local project; it owns every map and tileset. */
export type Project = {
    readonly id: Id

    name: string

    tilesets: Tileset[]

    maps: GameMap[]

    /** Character looks (T-027). The player uses `playerSpriteId`; NPCs pick from the same list later. */
    sprites: SpriteDefinition[]

    playerSpriteId: Id | null

    /** Where play begins (T-030). Null until the author picks; `startMap` falls back to the first map. */
    startMapId: Id | null
}

/** The middle of the grid: where a map starts the player until someone moves the spawn. */
export function centreCell(size: GridSize): Cell {
    return { x: Math.floor(size.width / 2), y: Math.floor(size.height / 2) }
}

export function newMap(name: string, layers: Layer[] = [], size: GridSize = DEFAULT_MAP_SIZE): GameMap {
    return { id: newId(), name, tileMap: emptyTileMap(size), spawn: centreCell(size), connections: {}, events: [], layers }
}

export function newProject(name: string, maps: GameMap[] = []): Project {
    return { id: newId(), name, tilesets: [], maps, sprites: [], playerSpriteId: null, startMapId: null }
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
        sprites: stored.sprites ?? [],
        playerSpriteId: stored.playerSpriteId ?? null,
        startMapId: stored.startMapId ?? null,
        maps: stored.maps.map(map => {
            const tileMap = withTileMapDefaults(map.tileMap ?? emptyTileMap(DEFAULT_MAP_SIZE))

            return {
                ...map,
                tileMap,
                spawn: isCell(map.spawn) && isInside(tileMap, map.spawn) ? map.spawn : centreCell(tileMap),
                connections: map.connections ?? {},
                events: map.events ?? [],
                layers: map.layers ?? [],
            }
        }),
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

/** A new project without the map. Removing the last map leaves an empty project; removing the start map clears it. */
export function removeMap(project: Project, mapId: Id): Project {
    return {
        ...project,
        maps: project.maps.filter(map => map.id !== mapId),
        startMapId: project.startMapId === mapId ? null : project.startMapId,
    }
}

/** A new project starting play on `mapId`, or unchanged when the id is unknown. */
export function withStartMap(project: Project, mapId: Id | null): Project {
    if (mapId !== null && findMap(project, mapId) === undefined) {
        return project
    }

    return { ...project, startMapId: mapId }
}

/** The map play opens: the chosen start map when it still exists, else the first map, else undefined. */
export function startMap(project: Project): GameMap | undefined {
    const chosen = project.startMapId === null ? undefined : findMap(project, project.startMapId)

    return chosen ?? project.maps[0]
}

/** A new project with one map's grid replaced. A spawn the new grid no longer contains moves to the centre. */
export function withMapTileMap(project: Project, mapId: Id, tileMap: TileMap): Project {
    return {
        ...project,
        maps: project.maps.map(map => map.id === mapId
            ? { ...map, tileMap, spawn: isInside(tileMap, map.spawn) ? map.spawn : centreCell(tileMap) }
            : map),
    }
}

/** A new project with one map's edge connections replaced. */
export function withMapConnections(project: Project, mapId: Id, connections: Connections): Project {
    return {
        ...project,
        maps: project.maps.map(map => map.id === mapId ? { ...map, connections } : map),
    }
}

/** A new project with one map's event list replaced. */
export function withMapEvents(project: Project, mapId: Id, events: MapEvent[]): Project {
    return {
        ...project,
        maps: project.maps.map(map => map.id === mapId ? { ...map, events } : map),
    }
}

/** A new project with one map's spawn moved, or unchanged when the cell is off the grid. */
export function withMapSpawn(project: Project, mapId: Id, spawn: Cell): Project {
    return {
        ...project,
        maps: project.maps.map(map => map.id === mapId && isInside(map.tileMap, spawn) ? { ...map, spawn } : map),
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

export function findSprite(project: Project, spriteId: Id): SpriteDefinition | undefined {
    return project.sprites.find(sprite => sprite.id === spriteId)
}

export function addSprite(project: Project, sprite: SpriteDefinition): Project {
    return { ...project, sprites: [...project.sprites, sprite] }
}

/** A new project with one sprite replaced by id, or unchanged when the id is unknown. */
export function withSprite(project: Project, sprite: SpriteDefinition): Project {
    return {
        ...project,
        sprites: project.sprites.map(existing => existing.id === sprite.id ? sprite : existing),
    }
}

/** Removing the player's sprite also clears `playerSpriteId`. */
export function removeSprite(project: Project, spriteId: Id): Project {
    return {
        ...project,
        sprites: project.sprites.filter(sprite => sprite.id !== spriteId),
        playerSpriteId: project.playerSpriteId === spriteId ? null : project.playerSpriteId,
    }
}

/** A new project with the player wearing `spriteId`, or unchanged when the id is unknown. */
export function withPlayerSprite(project: Project, spriteId: Id | null): Project {
    if (spriteId !== null && findSprite(project, spriteId) === undefined) {
        return project
    }

    return { ...project, playerSpriteId: spriteId }
}

/** The player's sprite definition, when one is assigned and still exists. */
export function playerSprite(project: Project): SpriteDefinition | undefined {
    return project.playerSpriteId === null ? undefined : findSprite(project, project.playerSpriteId)
}
