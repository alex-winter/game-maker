import { LAYERS } from 'Client/Constants/layers'
import { LEFT_BUTTON, MIDDLE_BUTTON } from 'Client/Constants/mouse-events'
import { Component, ExternalListeners, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { buildScene } from 'Client/Service/build-scene'
import { camera } from 'Client/Service/camera'
import { canvasDrawPort } from 'Client/Service/canvas-draw-port'
import { CellBounds } from 'Client/Service/flood-fill-cells'
import { generateImageDataURL } from 'Client/Service/generate-image'
import { erase, fill, pencil } from 'Client/Service/placement-painter'
import { pointerToWorld } from 'Client/Service/pointer-to-world'
import { layerRepository } from 'Client/Service/Repository/LayerRepository'
import { loadedPlacementRepository } from 'Client/Service/Repository/LoadedPlacement'
import { placementImageRepository } from 'Client/Service/Repository/PlacementImageRepository'
import { projectRepository } from 'Client/Service/Repository/ProjectRepository'
import { sheetRepository } from 'Client/Service/Repository/SheetRepository'
import { Coordinates } from 'domain/coordinates'
import { GRID_SIZE, snapToGrid } from 'domain/grid'
import { Id } from 'domain/id'
import { GameMap } from 'domain/project'
import { DrawPort } from 'engine/draw-port'
import { startLoop } from 'engine/loop'
import { renderFrame } from 'engine/render'
import { Scene } from 'engine/scene'
import { Layer } from 'Model/Layer'

/**
 * The one canvas the editor draws the active map into, through the engine's
 * `renderFrame`. It also owns the pointer: pencil, fill, and rubber act on
 * the active layer; the middle button pans the shared camera.
 */
export class MapCanvas extends Component<{ map: GameMap }> {
    private static readonly COLLISION_IMAGE: string = generateImageDataURL(
        GRID_SIZE,
        GRID_SIZE,
        { r: 255, g: 0, b: 0, a: 0.3 },
    )
    private static readonly DEFAULT_IMAGE: string = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='

    private map!: GameMap
    private sheetById = new Map<Id, CanvasImageSource>()
    private layers: Layer[] = []
    private scene: Scene<CanvasImageSource> | undefined
    private port: DrawPort<CanvasImageSource> | undefined
    private stopLoop: (() => void) | undefined
    private resizeObserver: ResizeObserver | undefined

    private selectedImageSrc: string = MapCanvas.DEFAULT_IMAGE
    private toolSelection: string = 'pencil'
    private isPanning: boolean = false
    private lastMousePosition: Coordinates = { x: 0, y: 0 }

    protected readonly externalListeners: ExternalListeners = {
        'layers-created': this.invalidate,
        'layer-changed': this.invalidate,
        'layer-deleted': this.invalidate,
        'placement-removed': this.invalidate,
        'sheet-selection-made': this.handleCurrentImageChange,
        'tool-selection': this.handleToolSelection,
        'request-focus-on-placement': this.handleRequestFocusOnPlacement,
    }

    protected readonly listeners: Listeners = {
        '.container:mouseleave': this.handleMouseLeave,
        '.container:mousedown': this.handleMouseDown,
        '.container:mousemove': this.handleMouseMove,
        '.container:mouseup': this.handleMouseUp,
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
            }

            canvas {
                display: block;
                image-rendering: pixelated;
            }

            .current-image {
                position: absolute;
                pointer-events: none;
            }

            .current-image.hide {
                display: none;
            }
        `
    }

    protected async setup(): Promise<void> {
        this.map = this.parsedDataset.map
        this.layers = await layerRepository.getAll()

        await this.loadSheets()
    }

    protected build(): HTMLElement {
        const container = Dom.div('container')
        const canvas = Dom.canvas()
        const ghost = document.createElement('img')

        ghost.classList.add('current-image', 'hide')
        ghost.src = this.selectedImageSrc

        container.append(canvas, ghost)

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

    private fitCanvas(): void {
        const canvas = this.getCanvas()

        if (canvas && (canvas.width !== this.clientWidth || canvas.height !== this.clientHeight)) {
            canvas.width = this.clientWidth
            canvas.height = this.clientHeight
        }
    }

    /** Marks the scene stale; the next frame rebuilds it from the repositories. */
    private invalidate(): void {
        this.scene = undefined
    }

    private currentScene(): Scene<CanvasImageSource> {
        if (this.scene === undefined) {
            const tileset = projectRepository.cachedTileset(this.map.tileMap.tilesetId)

            this.scene = buildScene({
                tileMap: this.map.tileMap,
                tileset,
                sheetById: this.sheetById,
                layers: this.layers,
                loadedPlacements: loadedPlacementRepository.get(),
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
        return this.findOne('canvas')
    }

    private getGhost(): HTMLImageElement | null {
        return this.findOne('.current-image')
    }

    private getContainer(): HTMLDivElement | null {
        return this.findOne('.container')
    }

    private activeLayer(): Layer | undefined {
        return this.layers.find(layer => layer.is_active)
    }

    /** Collision layers always paint the translucent red marker. */
    private brushSrcFor(layer: Layer): string {
        return layer.type === LAYERS.typeCollision ? MapCanvas.COLLISION_IMAGE : this.selectedImageSrc
    }

    private hasBrush(layer: Layer): boolean {
        return this.brushSrcFor(layer) !== MapCanvas.DEFAULT_IMAGE
    }

    private brushImageUuid(layer: Layer): Promise<string> {
        return placementImageRepository
            .findOrCreateBySrc(this.brushSrcFor(layer))
            .then(image => image.uuid)
    }

    private snappedWorldPointAt(event: MouseEvent): Coordinates {
        const container = this.getContainer()
        const rect = container ? container.getBoundingClientRect() : { left: 0, top: 0 }
        const world = pointerToWorld(event, rect, camera.get())

        return {
            x: snapToGrid(world.x),
            y: snapToGrid(world.y),
        }
    }

    /** Moves the ghost preview to the cell under the pointer. */
    private trackPointer(event: MouseEvent): void {
        const ghost = this.getGhost()
        const layer = this.activeLayer()

        if (!ghost || layer === undefined) {
            ghost?.classList.add('hide')
            return
        }

        const cell = this.snappedWorldPointAt(event)
        const view = camera.get()
        const src = this.brushSrcFor(layer)

        if (ghost.getAttribute('src') !== src) {
            ghost.src = src
        }

        ghost.classList.remove('hide')
        ghost.style.left = (cell.x - view.x) + 'px'
        ghost.style.top = (cell.y - view.y) + 'px'
    }

    private panTo(clientX: number, clientY: number): void {
        camera.panBy(
            this.lastMousePosition.x - clientX,
            this.lastMousePosition.y - clientY,
        )

        this.lastMousePosition.x = clientX
        this.lastMousePosition.y = clientY
    }

    /** The visible map, in cells. Fill does not run off into the infinite plane. */
    private visibleCellBounds(): CellBounds {
        const view = camera.get()
        const width = this.port?.width ?? 0
        const height = this.port?.height ?? 0

        return {
            minX: snapToGrid(view.x),
            minY: snapToGrid(view.y),
            maxX: snapToGrid(view.x + width),
            maxY: snapToGrid(view.y + height),
        }
    }

    /**
     * Runs `step` for the mousedown and every mousemove until mouseup, then
     * persists the layer once every step has settled.
     */
    private runStroke(
        firstEvent: MouseEvent,
        layer: Layer,
        step: (cell: Coordinates) => Promise<void>,
        onDone: () => void,
    ): void {
        const stepAndRedraw = async (cell: Coordinates): Promise<void> => {
            await step(cell)
            this.invalidate()
        }

        const pending: Promise<void>[] = [stepAndRedraw(this.snappedWorldPointAt(firstEvent))]

        const mouseMove = (event: MouseEvent) => {
            pending.push(stepAndRedraw(this.snappedWorldPointAt(event)))
        }

        const mouseUp = async () => {
            document.removeEventListener('mouseup', mouseUp)
            document.removeEventListener('mousemove', mouseMove)

            await Promise.all(pending)

            Events.emit('layer-placement-made', layer)
            onDone()
        }

        document.addEventListener('mouseup', mouseUp)
        document.addEventListener('mousemove', mouseMove)
    }

    /** Listeners attach synchronously on mousedown; the brush id resolves once, inside the first step. */
    private startPencil(event: MouseEvent, layer: Layer): void {
        if (!this.hasBrush(layer)) {
            return
        }

        const imageUuid = this.brushImageUuid(layer)

        this.runStroke(
            event,
            layer,
            async cell => pencil(layer, cell, await imageUuid),
            () => Events.emit('placement-added', undefined),
        )
    }

    private async startFill(event: MouseEvent, layer: Layer): Promise<void> {
        if (!this.hasBrush(layer)) {
            return
        }

        const imageUuid = await this.brushImageUuid(layer)
        const filled = await fill(layer, this.snappedWorldPointAt(event), imageUuid, this.visibleCellBounds())

        if (!filled) {
            return
        }

        this.invalidate()
        Events.emit('layer-placement-made', layer)
        Events.emit('placement-added', undefined)
    }

    private handleMouseDown(event: MouseEvent): void {
        this.trackPointer(event)

        if (event.button === MIDDLE_BUTTON) {
            event.preventDefault()
            this.isPanning = true
            this.lastMousePosition = { x: event.clientX, y: event.clientY }
            return
        }

        const layer = this.activeLayer()

        if (event.button !== LEFT_BUTTON || layer === undefined) {
            return
        }

        if (this.toolSelection === 'pencil') {
            this.startPencil(event, layer)
        }

        if (this.toolSelection === 'fill') {
            void this.startFill(event, layer)
        }

        if (this.toolSelection === 'rubber') {
            this.runStroke(event, layer, async cell => erase(layer, cell), () => undefined)
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

    private handleCurrentImageChange(newImage: HTMLImageElement): void {
        this.selectedImageSrc = newImage.src
    }

    private handleToolSelection(toolSelection: string): void {
        this.toolSelection = toolSelection
    }

    private handleRequestFocusOnPlacement(uuid: string): void {
        const target = loadedPlacementRepository.getByUuid(uuid)

        if (!target || this.port === undefined) {
            return
        }

        const targetViewX = target.x + target.width / 2 - this.port.width / 2
        const targetViewY = target.y + target.height / 2 - this.port.height / 2

        const start = camera.get()
        const deltaX = targetViewX - start.x
        const deltaY = targetViewY - start.y

        const duration = 300
        const startTime = performance.now()

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            const easeOut = 1 - Math.pow(1 - progress, 3)

            camera.set({
                x: start.x + deltaX * easeOut,
                y: start.y + deltaY * easeOut,
            })

            if (progress < 1) {
                requestAnimationFrame(animate)
            } else {
                Events.emit('updated-view-coordinates', camera.get())
            }
        }

        requestAnimationFrame(animate)
    }
}
