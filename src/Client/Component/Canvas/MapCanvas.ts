import { LEFT_BUTTON, MIDDLE_BUTTON } from 'Client/Constants/mouse-events'
import { Component, ExternalListeners, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { Brush, BRUSH_CHANGED, brush } from 'Client/Service/brush'
import { buildScene } from 'Client/Service/build-scene'
import { camera } from 'Client/Service/camera'
import { canvasDrawPort } from 'Client/Service/canvas-draw-port'
import { loadLegacyPlacements } from 'Client/Service/load-legacy-placements'
import { MAP_SESSION_CHANGED, mapSession } from 'Client/Service/map-session'
import { pointerToWorld } from 'Client/Service/pointer-to-world'
import { projectRepository } from 'Client/Service/Repository/ProjectRepository'
import { sheetRepository } from 'Client/Service/Repository/SheetRepository'
import { isTool, Tool } from 'Client/Service/tool'
import { LoadedPlacement } from 'Client/Model/LoadedPlacement'
import { Cell, Coordinates } from 'domain/coordinates'
import { GRID_SIZE, pixelToCell } from 'domain/grid'
import { Id } from 'domain/id'
import { floodFill, TileLayer, TileMap, withRect, withTile } from 'domain/map'
import { GameMap } from 'domain/project'
import { EMPTY_METATILE_ID, metatileById, MetatileId } from 'domain/tileset'
import { DrawPort } from 'engine/draw-port'
import { startLoop } from 'engine/loop'
import { renderFrame } from 'engine/render'
import { Scene } from 'engine/scene'

/**
 * The one canvas the editor draws the active map into, through the engine's
 * `renderFrame`. It owns the pointer: pencil, fill, rectangle, and rubber
 * write metatile ids onto the session's active layer; the middle button pans.
 */
export class MapCanvas extends Component<{ map: GameMap }> {
    private sheetById = new Map<Id, CanvasImageSource>()
    private background: LoadedPlacement[] = []
    private scene: Scene<CanvasImageSource> | undefined
    private port: DrawPort<CanvasImageSource> | undefined
    private stopLoop: (() => void) | undefined
    private resizeObserver: ResizeObserver | undefined

    private tool: Tool = 'pencil'
    private isPanning: boolean = false
    private lastMousePosition: Coordinates = { x: 0, y: 0 }

    protected readonly externalListeners: ExternalListeners = {
        [MAP_SESSION_CHANGED]: this.invalidate,
        [BRUSH_CHANGED]: this.redrawGhost,
        'tool-selection': this.handleToolSelection,
    }

    protected readonly listeners: Listeners = {
        '.container:mouseleave': this.handleMouseLeave,
        '.container:mousedown': this.handleMouseDown,
        '.container:mousemove': this.handleMouseMove,
        '.container:mouseup': this.handleMouseUp,
        '.container:contextmenu': this.handleContextMenu,
    }

    protected css(): string {
        return /*css*/`
            :host {
                display: block;
                position: absolute;
                inset: 0;
            }

            .container {
                position: relative;
                width: 100%;
                height: 100%;
                overflow: hidden;
                background: #2b2b2b;
            }

            canvas {
                display: block;
                image-rendering: pixelated;
            }

            .ghost {
                position: absolute;
                pointer-events: none;
                width: ${GRID_SIZE}px;
                height: ${GRID_SIZE}px;
                opacity: 0.7;
                outline: 1px solid rgba(255, 255, 255, 0.8);
            }

            .ghost.hide, .selection.hide {
                display: none;
            }

            .selection {
                position: absolute;
                pointer-events: none;
                border: 1px solid #ffd54f;
                background: rgba(255, 213, 79, 0.25);
            }
        `
    }

    protected async setup(): Promise<void> {
        await Promise.all([this.loadSheets(), this.loadBackground()])
    }

    protected build(): HTMLElement {
        const container = Dom.div('container')
        const canvas = Dom.canvas()
        const ghost = Dom.canvas(GRID_SIZE, GRID_SIZE)
        const selection = Dom.div('selection', 'hide')

        ghost.classList.add('ghost', 'hide')

        container.append(canvas, ghost, selection)

        return container
    }

    protected afterBuild(): void {
        const canvas = this.getCanvas()
        const ctx = canvas?.getContext('2d')

        if (!canvas || !ctx) {
            return
        }

        this.port = canvasDrawPort(ctx)

        this.resizeObserver = new ResizeObserver(() => this.fitCanvas())
        this.resizeObserver.observe(this)
        this.fitCanvas()
        this.redrawGhost()

        this.stopLoop = startLoop(() => this.frame(), callback => window.requestAnimationFrame(callback))
    }

    protected disconnectedCallback(): void {
        this.stopLoop?.()
        this.resizeObserver?.disconnect()
        super.disconnectedCallback()
    }

    /** Every sheet the project may cut metatiles from, decoded once. */
    private async loadSheets(): Promise<void> {
        const sheets = await sheetRepository.getAll()
        const images = await Promise.all(sheets.map(sheet => Dom.image(sheet.imageSrc)))

        sheets.forEach((sheet, index) => this.sheetById.set(sheet.id, images[index]))
    }

    /** A map painted before metatiles keeps its pictures as a frozen, read-only background. */
    private async loadBackground(): Promise<void> {
        this.background = await loadLegacyPlacements(this.parsedDataset.map.layers)
    }

    private fitCanvas(): void {
        const canvas = this.getCanvas()

        if (canvas && (canvas.width !== this.clientWidth || canvas.height !== this.clientHeight)) {
            canvas.width = this.clientWidth
            canvas.height = this.clientHeight
        }
    }

    /** Marks the scene stale; the next frame rebuilds it from the session. */
    private invalidate(): void {
        this.scene = undefined
    }

    private currentScene(): Scene<CanvasImageSource> {
        if (this.scene === undefined) {
            const map = mapSession.current

            this.scene = buildScene({
                tileMap: mapSession.visibleTileMap(),
                tileset: projectRepository.cachedTileset(map.tileMap.tilesetId),
                sheetById: this.sheetById,
                layers: map.layers,
                loadedPlacements: this.background,
            })
        }

        return this.scene
    }

    private frame(): void {
        if (this.port === undefined) {
            return
        }

        renderFrame(this.port, this.currentScene(), camera.get())
    }

    private getCanvas(): HTMLCanvasElement | null {
        return this.findOne('canvas:not(.ghost)')
    }

    private getGhost(): HTMLCanvasElement | null {
        return this.findOne('canvas.ghost')
    }

    private getSelection(): HTMLDivElement | null {
        return this.findOne('.selection')
    }

    private getContainer(): HTMLDivElement | null {
        return this.findOne('.container')
    }

    private cellAt(event: MouseEvent): Cell {
        const container = this.getContainer()
        const rect = container ? container.getBoundingClientRect() : { left: 0, top: 0 }
        const world = pointerToWorld(event, rect, camera.get())

        return pixelToCell(world)
    }

    /**
     * The id the current tool writes, or undefined when it cannot paint: no
     * brush, or a brush from a different tileset than the map already uses.
     * A map without a tileset adopts the brush's tileset on the first stroke.
     */
    private paintIdFor(tool: Tool, current: Brush | undefined): MetatileId | undefined {
        if (tool === 'rubber') {
            return EMPTY_METATILE_ID
        }

        if (current === undefined) {
            return undefined
        }

        const tileMap = mapSession.tileMap

        if (tileMap.tilesetId === null) {
            mapSession.update({ ...tileMap, tilesetId: current.tilesetId })
        } else if (tileMap.tilesetId !== current.tilesetId) {
            console.info('The map uses a different tileset than the brush; pick a metatile from the map\'s tileset.')
            return undefined
        }

        return current.metatileId
    }

    /** Redraws the one-cell ghost preview from the brush's rectangle on its sheet. */
    private redrawGhost(): void {
        const ghost = this.getGhost()
        const ctx = ghost?.getContext('2d')
        const current = brush.get()

        if (!ghost || !ctx) {
            return
        }

        ctx.clearRect(0, 0, GRID_SIZE, GRID_SIZE)

        if (current === undefined) {
            return
        }

        const tileset = projectRepository.cachedTileset(current.tilesetId)
        const metatile = tileset === undefined ? undefined : metatileById(tileset, current.metatileId)
        const sheet = metatile === undefined ? undefined : this.sheetById.get(metatile.sheetId)

        if (metatile === undefined || sheet === undefined) {
            return
        }

        ctx.imageSmoothingEnabled = false
        ctx.drawImage(sheet, metatile.x, metatile.y, metatile.w, metatile.h, 0, 0, GRID_SIZE, GRID_SIZE)
    }

    /** Moves the ghost preview to the cell under the pointer. */
    private trackPointer(event: MouseEvent): void {
        const ghost = this.getGhost()

        if (!ghost) {
            return
        }

        if (this.tool === 'rubber' || brush.get() === undefined || mapSession.activeLayer === undefined) {
            ghost.classList.add('hide')
            return
        }

        const cell = this.cellAt(event)
        const view = camera.get()

        ghost.classList.remove('hide')
        ghost.style.left = (cell.x * GRID_SIZE - view.x) + 'px'
        ghost.style.top = (cell.y * GRID_SIZE - view.y) + 'px'
    }

    private showSelection(a: Cell, b: Cell): void {
        const selection = this.getSelection()

        if (!selection) {
            return
        }

        const view = camera.get()
        const left = Math.min(a.x, b.x) * GRID_SIZE
        const top = Math.min(a.y, b.y) * GRID_SIZE
        const width = (Math.abs(a.x - b.x) + 1) * GRID_SIZE
        const height = (Math.abs(a.y - b.y) + 1) * GRID_SIZE

        selection.classList.remove('hide')
        selection.style.left = (left - view.x) + 'px'
        selection.style.top = (top - view.y) + 'px'
        selection.style.width = width + 'px'
        selection.style.height = height + 'px'
    }

    private hideSelection(): void {
        this.getSelection()?.classList.add('hide')
    }

    private panTo(clientX: number, clientY: number): void {
        camera.panBy(
            this.lastMousePosition.x - clientX,
            this.lastMousePosition.y - clientY,
        )

        this.lastMousePosition.x = clientX
        this.lastMousePosition.y = clientY
    }

    /** The active layer as it is right now; strokes re-read it because each step replaces it. */
    private withActiveLayer(edit: (tileMap: TileMap, layer: TileLayer) => TileLayer): void {
        const tileMap = mapSession.tileMap
        const layer = mapSession.activeLayer

        if (layer === undefined) {
            return
        }

        const next = edit(tileMap, layer)

        if (next !== layer) {
            mapSession.update({ ...tileMap, layers: tileMap.layers.map(existing => existing.id === layer.id ? next : existing) })
        }
    }

    /** Pencil and rubber: one cell per pointer sample until mouseup, then one save. */
    private startStroke(firstEvent: MouseEvent, id: MetatileId): void {
        const paint = (event: MouseEvent) => {
            const cell = this.cellAt(event)

            this.withActiveLayer((tileMap, layer) => withTile(tileMap, layer, cell, id))
        }

        const mouseMove = (event: MouseEvent) => paint(event)

        const mouseUp = () => {
            document.removeEventListener('mouseup', mouseUp)
            document.removeEventListener('mousemove', mouseMove)

            void mapSession.save()
        }

        document.addEventListener('mouseup', mouseUp)
        document.addEventListener('mousemove', mouseMove)

        paint(firstEvent)
    }

    /** Rectangle: drag two corners, preview the span, fill it on mouseup. */
    private startRect(firstEvent: MouseEvent, id: MetatileId): void {
        const start = this.cellAt(firstEvent)

        this.showSelection(start, start)

        const mouseMove = (event: MouseEvent) => this.showSelection(start, this.cellAt(event))

        const mouseUp = (event: MouseEvent) => {
            document.removeEventListener('mouseup', mouseUp)
            document.removeEventListener('mousemove', mouseMove)

            this.hideSelection()
            this.withActiveLayer((tileMap, layer) => withRect(tileMap, layer, start, this.cellAt(event), id))

            void mapSession.save()
        }

        document.addEventListener('mouseup', mouseUp)
        document.addEventListener('mousemove', mouseMove)
    }

    private fillAt(event: MouseEvent, id: MetatileId): void {
        const cell = this.cellAt(event)

        this.withActiveLayer((tileMap, layer) => floodFill(tileMap, layer, cell, id))

        void mapSession.save()
    }

    private handleMouseDown(event: MouseEvent): void {
        this.trackPointer(event)

        if (event.button === MIDDLE_BUTTON) {
            event.preventDefault()
            this.isPanning = true
            this.lastMousePosition = { x: event.clientX, y: event.clientY }
            return
        }

        if (event.button !== LEFT_BUTTON || mapSession.activeLayer === undefined) {
            return
        }

        const id = this.paintIdFor(this.tool, brush.get())

        if (id === undefined) {
            return
        }

        if (this.tool === 'fill') {
            this.fillAt(event, id)
        } else if (this.tool === 'rect') {
            this.startRect(event, id)
        } else {
            this.startStroke(event, id)
        }
    }

    private handleMouseMove(event: MouseEvent): void {
        if (this.isPanning) {
            this.panTo(event.clientX, event.clientY)
        }

        this.trackPointer(event)
    }

    private handleMouseUp(event: MouseEvent): void {
        if (event.button === MIDDLE_BUTTON && this.isPanning) {
            this.isPanning = false
            Events.emit('updated-view-coordinates', camera.get())
        }
    }

    private handleMouseLeave(): void {
        this.getGhost()?.classList.add('hide')
    }

    private handleContextMenu(event: Event): void {
        event.preventDefault()
    }

    private handleToolSelection(tool: string): void {
        if (isTool(tool)) {
            this.tool = tool
        }
    }
}
