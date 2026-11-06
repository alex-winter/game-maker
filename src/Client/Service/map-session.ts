import { Events } from 'Client/Service/Events'
import { projectRepository } from 'Client/Service/Repository/ProjectRepository'
import { Id } from 'domain/id'
import { findTileLayer, TileLayer, TileMap } from 'domain/map'
import { GameMap } from 'domain/project'

/** Emitted with no payload whenever the open map, its active layer, or a layer's visibility changes. */
export const MAP_SESSION_CHANGED = 'map-session-changed'

/**
 * The map the editor has open, plus the editor-only state around it: which
 * tile layer tools write to and which layers are hidden. Tools compute the
 * next grid with a pure domain function, `update` it live during a drag,
 * and `save` once at the end.
 */
class MapSession {
    private map: GameMap | undefined
    private activeLayerId: Id | undefined
    private readonly hiddenLayerIds = new Set<Id>()

    public open(map: GameMap): void {
        this.map = map
        this.activeLayerId = map.tileMap.layers[0]?.id
        this.hiddenLayerIds.clear()

        Events.emit(MAP_SESSION_CHANGED, undefined)
    }

    public get current(): GameMap {
        if (this.map === undefined) {
            throw new Error('No map is open; call mapSession.open first')
        }

        return this.map
    }

    public get tileMap(): TileMap {
        return this.current.tileMap
    }

    public get activeLayer(): TileLayer | undefined {
        return this.activeLayerId === undefined ? undefined : findTileLayer(this.tileMap, this.activeLayerId)
    }

    public isActive(layerId: Id): boolean {
        return this.activeLayerId === layerId
    }

    public setActiveLayer(layerId: Id): void {
        if (this.activeLayerId === layerId) {
            return
        }

        this.activeLayerId = layerId
        Events.emit(MAP_SESSION_CHANGED, undefined)
    }

    public isHidden(layerId: Id): boolean {
        return this.hiddenLayerIds.has(layerId)
    }

    public toggleHidden(layerId: Id): void {
        if (this.hiddenLayerIds.has(layerId)) {
            this.hiddenLayerIds.delete(layerId)
        } else {
            this.hiddenLayerIds.add(layerId)
        }

        Events.emit(MAP_SESSION_CHANGED, undefined)
    }

    /** The grid as the canvas should draw it: hidden layers left out. Data is untouched. */
    public visibleTileMap(): TileMap {
        const tileMap = this.tileMap

        return { ...tileMap, layers: tileMap.layers.filter(layer => !this.hiddenLayerIds.has(layer.id)) }
    }

    /** Replaces the grid in memory and tells the canvas. Nothing is written until `save`. */
    public update(tileMap: TileMap): void {
        const map = this.current

        if (map.tileMap === tileMap) {
            return
        }

        this.map = { ...map, tileMap }

        if (this.activeLayer === undefined) {
            this.activeLayerId = tileMap.layers[0]?.id
        }

        Events.emit(MAP_SESSION_CHANGED, undefined)
    }

    public save(): Promise<void> {
        const map = this.current

        return projectRepository.saveTileMap(map.id, map.tileMap)
    }

    /** `update` then `save`, for edits that are not part of a drag. */
    public commit(tileMap: TileMap): Promise<void> {
        this.update(tileMap)

        return this.save()
    }
}

export const mapSession = new MapSession()
