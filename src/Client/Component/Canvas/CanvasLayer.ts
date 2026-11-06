import { LAYERS } from 'Client/Constants/layers'
import { LEFT_BUTTON, MIDDLE_BUTTON } from 'Client/Constants/mouse-events'
import { Coordinates } from 'Model/Coordinates'
import { ImagePlacement } from 'Model/Placement'
import { Component, ExternalListeners, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { generateImageDataURL } from 'Client/Service/generate-image'
import { placementImageRepository } from 'Client/Service/Repository/PlacementImageRepository'
import { Layer } from 'Model/Layer'
import { Canvas2D } from 'Client/Component/Canvas/Canvas'
import { camera } from 'Client/Service/camera'
import { loadedPlacementRepository } from 'Client/Service/Repository/LoadedPlacement'
import { LayerChange, layerRepository } from 'Client/Service/Repository/LayerRepository'
import { loadPlacement } from 'Client/Service/load-placement'
import { pointerToWorld } from 'Client/Service/pointer-to-world'
import { snap } from 'Client/Service/snap'
import { CellBounds, floodFillCells } from 'Client/Service/flood-fill-cells'
import { LoadedPlacement } from 'Client/Model/LoadedPlacement'
import { drawOrder } from 'Model/draw-order'
import { GRID_SIZE } from 'Model/grid-size'
import { rectContainsPoint } from 'Model/rect-contains'

export class CanvasLayer extends Component {
    private static readonly BASE_Z_INDEX: number = 500
    private static readonly COLLISION_IMAGE: string = generateImageDataURL(
        GRID_SIZE,
        GRID_SIZE,
        { r: 255, g: 0, b: 0, a: 0.3 },
    )
    private static readonly DEFAULT_IMAGE: string = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='

    private currentImage!: HTMLImageElement

    private layer!: Layer
    private isMoving: boolean = false
    private lastMousePosition: Coordinates = { x: 0, y: 0 }
    private isCollisionLayer: boolean = false
    private toolSelection: string = 'pencil'

    private snap = snap(GRID_SIZE)

    protected readonly externalListeners: ExternalListeners = {
        'layer-deleted': this.handleDelete,
        'layer-changed': this.handleLayerChanged,
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
                z-index: 500;
                display: block;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
            }
            
            :host(.active) {
                pointer-events: all;
            }

            .current-image {
                position: absolute;
                pointer-events: none;
                z-index: 510;
            }
            .current-image.hide {
                display: none;
            }
       
            .container {
                position: relative;
                width: 100%;
                height: 100%;
                overflow: hidden;
            }
        `
    }

    protected async setup(): Promise<void> {
        this.layer = this.parsedDataset.layer
        this.isCollisionLayer = this.layer.type === LAYERS.typeCollision
        this.currentImage = await Dom.image(
            this.isCollisionLayer
                ? CanvasLayer.COLLISION_IMAGE
                : CanvasLayer.DEFAULT_IMAGE
        )
    }

    protected build(): HTMLElement {
        const container = Dom.div('container')
        const canvas = Dom.makeComponent(Canvas2D, { fps: 60 }) as Canvas2D

        this.currentImage.classList.add('current-image')

        container.append(
            canvas,
            this.currentImage,
        )

        this.applyLayerState(canvas)

        return container
    }

    protected afterBuild(): void {
        this.getCanvas().startAnimation(this.frameFn.bind(this))
    }

    /** Visibility, stacking, and the active pointer target, applied without rebuilding the canvas. */
    private applyLayerState(canvas: Canvas2D): void {
        this.classList.toggle('active', this.layer.is_active)
        canvas.classList.toggle('hide', !this.layer.is_visible)
        this.style.zIndex = (CanvasLayer.BASE_Z_INDEX + drawOrder(this.layer)).toString()
    }

    private getCanvas(): Canvas2D {
        return this.findOne('canvas-2d')!
    }

    private getCurrentImage(): HTMLImageElement {
        return this.findOne('.current-image')!
    }

    private getContainer(): HTMLDivElement {
        return this.findOne('.container')!
    }

    private snappedWorldPointAt(event: MouseEvent): Coordinates {
        const world = pointerToWorld(
            event,
            this.getContainer().getBoundingClientRect(),
            camera.get(),
        )

        return {
            x: this.snap(world.x),
            y: this.snap(world.y),
        }
    }

    /** Moves the ghost preview to the cell under the pointer. */
    private trackPointer(event: MouseEvent): void {
        const cell = this.snappedWorldPointAt(event)
        const currentImage = this.getCurrentImage()
        const view = camera.get()

        if (currentImage) {
            currentImage.classList.remove('hide')
            currentImage.style.left = (cell.x - view.x) + 'px'
            currentImage.style.top = (cell.y - view.y) + 'px'
        }
    }

    private panTo(clientX: number, clientY: number): void {
        camera.panBy(
            this.lastMousePosition.x - clientX,
            this.lastMousePosition.y - clientY,
        )

        this.lastMousePosition.x = clientX
        this.lastMousePosition.y = clientY
    }

    private frameFn(): void {
        const canvas = this.getCanvas()
        const view = camera.get()

        const visible = loadedPlacementRepository.get()
            .filter(loadedPlacement => loadedPlacement.layerUuid === this.layer.uuid)
            .filter(loadedPlacement => {
                return canvas.isRectVisible(
                    view,
                    loadedPlacement,
                )
            })

        for (const placement of visible) {
            canvas.drawImage(
                placement.image,
                Math.floor(placement.x - view.x),
                Math.floor(placement.y - view.y),
                placement.image.width,
                placement.image.height,
            )
        }
    }

    private hasImageSelected(): boolean {
        return this.getCurrentImage().src !== CanvasLayer.DEFAULT_IMAGE
    }

    private currentImageUuid(): Promise<string> {
        return placementImageRepository
            .findOrCreateBySrc(this.getCurrentImage().src)
            .then(image => image.uuid)
    }

    /** One placement at one cell. Pencil and fill both end here. */
    private stamp(cell: Coordinates, imageUuid: string): Promise<void> {
        const placement: ImagePlacement = {
            uuid: crypto.randomUUID(),
            coordinate: { x: cell.x, y: cell.y },
            imageUuid,
        }

        this.layer.placements.push(placement)

        return loadPlacement(placement, this.layer.uuid)
    }

    private async generatePlacement(cell: Coordinates): Promise<void> {
        if (!this.hasImageSelected()) {
            return
        }

        const imageUuid = await this.currentImageUuid()
        const lastPlacement = this.layer.placements[this.layer.placements.length - 1]

        if (
            lastPlacement
            && lastPlacement.coordinate.x === cell.x
            && lastPlacement.coordinate.y === cell.y
            && lastPlacement.imageUuid === imageUuid
        ) {
            return
        }

        await this.stamp(cell, imageUuid)
    }

    private loadedPlacementsOfThisLayer(): LoadedPlacement[] {
        return loadedPlacementRepository.get()
            .filter(loadedPlacement => loadedPlacement.layerUuid === this.layer.uuid)
    }

    /** The front-most loaded placement whose rectangle covers `cell`. */
    private placementCovering(cell: Coordinates): LoadedPlacement | undefined {
        const covering = this.loadedPlacementsOfThisLayer()
            .filter(loadedPlacement => rectContainsPoint(loadedPlacement, cell))

        return covering[covering.length - 1]
    }

    /**
     * Runs `step` for the mousedown and every mousemove until mouseup, then
     * persists the layer once every step has settled.
     */
    private runStroke(
        firstEvent: MouseEvent,
        step: (cell: Coordinates) => Promise<void>,
        onDone: () => void,
    ): void {
        const pending: Promise<void>[] = [step(this.snappedWorldPointAt(firstEvent))]

        const mouseMove = (event: MouseEvent) => {
            pending.push(step(this.snappedWorldPointAt(event)))
        }

        const mouseUp = async () => {
            document.removeEventListener('mouseup', mouseUp)
            document.removeEventListener('mousemove', mouseMove)

            await Promise.all(pending)

            Events.emit('layer-placement-made', this.layer)
            onDone()
        }

        document.addEventListener('mouseup', mouseUp)
        document.addEventListener('mousemove', mouseMove)
    }

    private handleMouseUp(event: MouseEvent): void {
        if (event.button === MIDDLE_BUTTON) {
            this.isMoving = false
            Events.emit('updated-view-coordinates', camera.get())
        }
    }

    private handleDelete(layerUuid: string) {
        const canvas = this.getCanvas()

        if (this.layer.uuid === layerUuid) {
            canvas.stopAnimation()
            canvas.remove()
            this.remove()
        }
    }

    private handleLayerChanged(change: LayerChange): void {
        if (change.uuid !== this.layer.uuid) {
            return
        }

        const layer = layerRepository.getByUuid(change.uuid)

        if (layer === undefined) {
            return
        }

        this.layer = layer
        this.applyLayerState(this.getCanvas())
    }

    private handleMouseMove(event: MouseEvent): void {
        if (this.isMoving) {
            this.panTo(event.clientX, event.clientY)
        }

        this.trackPointer(event)
    }

    private handleMouseDown(event: MouseEvent): void {
        this.trackPointer(event)

        if (event.button === LEFT_BUTTON) {
            if (this.toolSelection === 'pencil') {
                this.runStroke(
                    event,
                    cell => this.generatePlacement(cell),
                    () => Events.emit('placement-added', undefined),
                )
            }

            if (this.toolSelection === 'fill') {
                this.performFill(this.snappedWorldPointAt(event))
            }

            if (this.toolSelection === 'rubber') {
                this.runStroke(
                    event,
                    async cell => this.removePlacementAt(cell),
                    () => undefined,
                )
            }
        }

        if (event.button === MIDDLE_BUTTON) {
            this.isMoving = true
            this.lastMousePosition = { x: event.clientX, y: event.clientY }
        }
    }

    private removePlacementAt(cell: Coordinates): void {
        const covering = this.placementCovering(cell)

        if (covering === undefined) {
            return
        }

        const index = this.layer.placements.findIndex(p => p.uuid === covering.uuid)

        if (index !== -1) {
            this.layer.placements.splice(index, 1)
        }

        loadedPlacementRepository.removeByUuid(covering.uuid)
    }

    private handleMouseLeave(event: MouseEvent): void {
        this.getCurrentImage().classList.add('hide')
    }

    private handleCurrentImageChange(newImage: HTMLImageElement): void {
        this.getCurrentImage().src = newImage.src
        this.currentImage = newImage
    }

    /** The visible map, in cells. Fill does not run off into the infinite plane. */
    private visibleCellBounds(): CellBounds {
        const canvasRect = this.getCanvas().getBoundingClientRect()
        const view = camera.get()

        return {
            minX: this.snap(view.x),
            minY: this.snap(view.y),
            maxX: this.snap(view.x + canvasRect.width),
            maxY: this.snap(view.y + canvasRect.height),
        }
    }

    private imageUuidAt(cell: Coordinates): string | undefined {
        const covering = this.placementCovering(cell)

        if (covering === undefined) {
            return undefined
        }

        return this.layer.placements.find(p => p.uuid === covering.uuid)?.imageUuid
    }

    /** Replaces every connected cell that matches the clicked one with one placement per cell. */
    private async performFill(start: Coordinates): Promise<void> {
        if (!this.hasImageSelected()) {
            return
        }

        const newImageUuid = await this.currentImageUuid()

        if (this.imageUuidAt(start) === newImageUuid) {
            return
        }

        const cells = floodFillCells(
            start,
            this.visibleCellBounds(),
            GRID_SIZE,
            cell => this.imageUuidAt(cell),
        )

        if (cells.length === 0) {
            return
        }

        for (const cell of cells) {
            this.removePlacementAt(cell)
        }

        await Promise.all(
            cells.map(cell => this.stamp(cell, newImageUuid))
        )

        Events.emit('layer-placement-made', this.layer)
        Events.emit('placement-added', undefined)
    }


    private handleToolSelection(toolSelection: string): void {
        this.toolSelection = toolSelection
    }

    private handleRequestFocusOnPlacement(uuid: string): void {
        const targetPlacement = loadedPlacementRepository.getByUuid(uuid)
        const canvas = this.getCanvas()

        // The camera is shared, so only the layer that owns the placement animates it.
        if (!targetPlacement || !canvas || targetPlacement.layerUuid !== this.layer.uuid) return

        const canvasRect = canvas.getBoundingClientRect()

        const targetViewX = targetPlacement.x + targetPlacement.width / 2 - canvasRect.width / 2
        const targetViewY = targetPlacement.y + targetPlacement.height / 2 - canvasRect.height / 2

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