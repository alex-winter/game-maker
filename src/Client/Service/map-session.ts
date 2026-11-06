import { Events } from 'Client/Service/Events'
import { projectRepository } from 'Client/Service/Repository/ProjectRepository'
import { canRedo, canUndo, emptyHistory, History, record, redo, undo } from 'domain/history'
import { Id } from 'domain/id'
import { findTileLayer, MAX_ELEVATION, TileLayer, TileMap } from 'domain/map'
import { GameMap } from 'domain/project'
import { MapEvent } from 'domain/warp'

/** Emitted with no payload whenever the open map, the paint target, or an overlay's visibility changes. */
export const MAP_SESSION_CHANGED = 'map-session-changed'

/** What the tools write to: one tile layer's pictures, or one of the attribute grids. */
export type PaintTarget =
    | { readonly kind: 'layer'; readonly layerId: Id }
    | { readonly kind: 'collision' }
    | { readonly kind: 'elevation' }
    | { readonly kind: 'grass' }
    | { readonly kind: 'gate' }
    | { readonly kind: 'events' }

/** The keys `isHidden`/`toggleHidden` accept: a tile layer id, an attribute overlay, or the events overlay. */
export type OverlayKey = Id | 'collision' | 'elevation' | 'grass' | 'gate' | 'events'

/**
 * The map the editor has open, plus the editor-only state around it: what
 * the tools write to, which layers and overlays are hidden, and the undo
 * history. Tools compute the next grid with a pure domain function, `update`
 * it live during a drag, and `save` once at the end; the grid as it was
 * before the first `update` is what one undo step restores.
 */
class MapSession {
    private map: GameMap | undefined
    private paintTarget: PaintTarget | undefined
    private readonly hidden = new Set<OverlayKey>()
    private elevation: number = 1
    private history: History<TileMap> = emptyHistory()
    /** The grid before the edit in progress; recorded on `save`. */
    private beforeEdit: TileMap | undefined

    public open(map: GameMap): void {
        const first = map.tileMap.layers[0]

        this.map = map
        this.paintTarget = first === undefined ? undefined : { kind: 'layer', layerId: first.id }
        this.history = emptyHistory()
        this.beforeEdit = undefined
        this.hidden.clear()
        // Attribute overlays start hidden; picking one as the target shows it. Events stay visible: a warp is part of the map's meaning.
        this.hidden.add('collision')
        this.hidden.add('elevation')
        this.hidden.add('grass')
        this.hidden.add('gate')

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

    public get target(): PaintTarget | undefined {
        return this.paintTarget
    }

    /** The tile layer the tools write to, or undefined when an attribute grid is the target. */
    public get activeLayer(): TileLayer | undefined {
        return this.paintTarget?.kind === 'layer' ? findTileLayer(this.tileMap, this.paintTarget.layerId) : undefined
    }

    public isTarget(target: PaintTarget): boolean {
        const current = this.paintTarget

        if (current === undefined || current.kind !== target.kind) {
            return false
        }

        return current.kind !== 'layer' || target.kind !== 'layer' || current.layerId === target.layerId
    }

    public setTarget(target: PaintTarget): void {
        if (this.isTarget(target)) {
            return
        }

        this.paintTarget = target

        if (target.kind !== 'layer') {
            this.hidden.delete(target.kind)
        }

        Events.emit(MAP_SESSION_CHANGED, undefined)
    }

    /** The elevation the pencil writes when the elevation grid is the target. */
    public get elevationBrush(): number {
        return this.elevation
    }

    public setElevationBrush(value: number): void {
        this.elevation = Math.min(MAX_ELEVATION, Math.max(1, Math.round(value)))
        Events.emit(MAP_SESSION_CHANGED, undefined)
    }

    public isHidden(key: OverlayKey): boolean {
        return this.hidden.has(key)
    }

    public toggleHidden(key: OverlayKey): void {
        if (this.hidden.has(key)) {
            this.hidden.delete(key)
        } else {
            this.hidden.add(key)
        }

        Events.emit(MAP_SESSION_CHANGED, undefined)
    }

    /** The grid as the canvas should draw it: hidden layers left out. Data is untouched. */
    public visibleTileMap(): TileMap {
        const tileMap = this.tileMap

        return { ...tileMap, layers: tileMap.layers.filter(layer => !this.hidden.has(layer.id)) }
    }

    /** Replaces the grid in memory and tells the canvas. Nothing is written until `save`. */
    public update(tileMap: TileMap): void {
        const map = this.current

        if (map.tileMap === tileMap) {
            return
        }

        if (this.beforeEdit === undefined) {
            this.beforeEdit = map.tileMap
        }

        this.replace({ ...map, tileMap })
    }

    private replace(map: GameMap): void {
        const tileMap = map.tileMap

        this.map = map

        if (this.paintTarget?.kind === 'layer' && this.activeLayer === undefined) {
            const first = tileMap.layers[0]

            this.paintTarget = first === undefined ? undefined : { kind: 'layer', layerId: first.id }
        }

        Events.emit(MAP_SESSION_CHANGED, undefined)
    }

    /** Writes the grid and closes the edit in progress as one undo step. */
    public save(): Promise<void> {
        const map = this.current

        if (this.beforeEdit !== undefined && this.beforeEdit !== map.tileMap) {
            this.history = record(this.history, this.beforeEdit)
        }

        this.beforeEdit = undefined

        return projectRepository.saveTileMap(map.id, map.tileMap)
    }

    public get canUndo(): boolean {
        return canUndo(this.history)
    }

    public get canRedo(): boolean {
        return canRedo(this.history)
    }

    public undo(): Promise<void> {
        const stepped = undo(this.history, this.tileMap)

        return stepped === undefined ? Promise.resolve() : this.restore(stepped.history, stepped.state)
    }

    public redo(): Promise<void> {
        const stepped = redo(this.history, this.tileMap)

        return stepped === undefined ? Promise.resolve() : this.restore(stepped.history, stepped.state)
    }

    private restore(history: History<TileMap>, tileMap: TileMap): Promise<void> {
        const map = this.current

        this.history = history
        this.beforeEdit = undefined
        this.replace({ ...map, tileMap })

        return projectRepository.saveTileMap(map.id, tileMap)
    }

    /** Replaces the map's events and writes them. Events are not part of the tile undo history. */
    public async commitEvents(events: MapEvent[]): Promise<void> {
        const map = this.current

        this.map = { ...map, events }
        Events.emit(MAP_SESSION_CHANGED, undefined)

        await projectRepository.saveEvents(map.id, events)
    }

    /** `update` then `save`, for edits that are not part of a drag. */
    public commit(tileMap: TileMap): Promise<void> {
        this.update(tileMap)

        return this.save()
    }
}

export const mapSession = new MapSession()
