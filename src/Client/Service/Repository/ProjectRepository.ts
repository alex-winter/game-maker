import { Repository } from 'Client/Service/Repository/Repository'
import { Id } from 'domain/id'
import { GridSize, TileMap } from 'domain/map'
import { addSprite, GameMap, Project, removeMap, removeSprite, withMapTileMap, withMapTileset, withPlayerSprite, withSprite, withStartMap, withTileset } from 'domain/project'
import { SpriteDefinition } from 'domain/sprite'
import { Metatile, MetatileAttributes, MetatileId, Tileset, withMetatileAttributes } from 'domain/tileset'

class ProjectRepository extends Repository {
    private readonly API_PATH = '/project'

    private project: Project | undefined

    public async load(): Promise<Project> {
        if (this.project === undefined) {
            this.project = await this.get<Project>(this.API_PATH)
        }

        return this.project
    }

    /** From the loaded project; undefined before `load` resolves or for a map without a tileset. */
    public cachedTileset(tilesetId: Id | null): Tileset | undefined {
        if (tilesetId === null) {
            return undefined
        }

        return this.project?.tilesets.find(tileset => tileset.id === tilesetId)
    }

    public async createTileset(name: string, metatiles: Metatile[]): Promise<Tileset> {
        const response = await this.post(this.API_PATH + '/tilesets', { name, metatiles })
        const tileset: Tileset = await response.json()

        this.project?.tilesets.push(tileset)

        return tileset
    }

    public async setMetatileAttributes(
        tilesetId: Id,
        metatileId: MetatileId,
        attributes: Partial<MetatileAttributes>,
    ): Promise<void> {
        await this.patch(`${this.API_PATH}/tilesets/${tilesetId}/metatiles/${metatileId}`, attributes)

        const tileset = this.cachedTileset(tilesetId)

        if (this.project && tileset) {
            this.project = withTileset(this.project, withMetatileAttributes(tileset, metatileId, attributes))
        }
    }

    /** Replaces one map's whole grid on the server and in the cache. */
    public async saveTileMap(mapId: Id, tileMap: TileMap): Promise<void> {
        await this.put(`${this.API_PATH}/maps/${mapId}/tile-map`, tileMap)

        if (this.project) {
            this.project = withMapTileMap(this.project, mapId, tileMap)
        }
    }

    public async setMapTileset(mapId: Id, tilesetId: Id | null): Promise<void> {
        await this.put(`${this.API_PATH}/maps/${mapId}/tileset`, { tilesetId })

        if (this.project) {
            this.project = withMapTileset(this.project, mapId, tilesetId)
        }
    }

    public async createSprite(input: Omit<SpriteDefinition, 'id'>): Promise<SpriteDefinition> {
        const response = await this.post(this.API_PATH + '/sprites', input)
        const sprite: SpriteDefinition = await response.json()

        if (this.project) {
            this.project = addSprite(this.project, sprite)
        }

        return sprite
    }

    public async saveSprite(sprite: SpriteDefinition): Promise<void> {
        await this.put(this.API_PATH + '/sprites/' + sprite.id, sprite)

        if (this.project) {
            this.project = withSprite(this.project, sprite)
        }
    }

    public async deleteSprite(spriteId: Id): Promise<void> {
        await this.delete(this.API_PATH + '/sprites/' + spriteId)

        if (this.project) {
            this.project = removeSprite(this.project, spriteId)
        }
    }

    public async setPlayerSprite(spriteId: Id | null): Promise<void> {
        await this.put(this.API_PATH + '/player-sprite', { spriteId })

        if (this.project) {
            this.project = withPlayerSprite(this.project, spriteId)
        }
    }

    public async setStartMap(mapId: Id | null): Promise<void> {
        await this.put(this.API_PATH + '/start-map', { mapId })

        if (this.project) {
            this.project = withStartMap(this.project, mapId)
        }
    }

    public async createMap(name: string): Promise<GameMap> {
        const response = await this.post(this.API_PATH + '/maps', { name })
        const map: GameMap = await response.json()

        this.project?.maps.push(map)

        return map
    }

    public async deleteMap(mapId: Id): Promise<void> {
        await this.delete(this.API_PATH + '/maps/' + mapId)

        if (this.project) {
            this.project = removeMap(this.project, mapId)
        }
    }

    public async resizeMap(mapId: Id, size: GridSize): Promise<GameMap> {
        const response = await this.put(`${this.API_PATH}/maps/${mapId}/size`, size)
        const resized: GameMap = await response.json()

        if (this.project) {
            this.project = withMapTileMap(this.project, mapId, resized.tileMap)
        }

        return resized
    }

    public async renameMap(mapId: Id, name: string): Promise<GameMap> {
        const response = await this.patch(this.API_PATH + '/maps/' + mapId, { name })
        const renamed: GameMap = await response.json()
        const cached = this.project?.maps.find(map => map.id === mapId)

        if (cached) {
            cached.name = renamed.name
        }

        return renamed
    }
}

export const projectRepository = new ProjectRepository()
