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
import { loadedPlacementRepository } from 'Client/Service/Repository/LoadedPlacement'

type Movement = {
    layerUuid: string

    clientX: number

    clientY: number

    viewCoordinates: Coordinates

    lastMousePosition: Coordinates
}

export class CanvasLayer extends Component {
    private static readonly TILE_SIZE: number = 16
    private static readonly COLLISION_IMAGE: string = generateImageDataURL(
        CanvasLayer.TILE_SIZE,
        CanvasLayer.TILE_SIZE,
        { r: 255, g: 0, b: 0, a: 0.3 },
    )
    private static readonly DEFAULT_IMAGE: string = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='

    private currentImage!: HTMLImageElement

    private layer!: Layer
    private readonly mouseCoordinates: Coordinates = { x: 0, y: 0 }
    private isMoving: boolean = false
    private lastMousePosition: Coordinates = { x: 0, y: 0 }
    private viewCoordinates: Coordinates = { x: 0, y: 0 }
    private isCollisionLayer: boolean = false
    private toolSelection: string = 'pencil'
    private placementBufferMs: number = 1000

    protected readonly externalListeners: ExternalListeners = {
        'layer-deleted': this.handleDelete,
        'layer-update': this.handleLayerUpdate,
        'moving-in-canvas': this.handleMovement,
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
                position: fixed;
                pointer-events: none;
                z-index: 510;
            }
            .current-image.hide {
                display: none;
            }

       
            .container {
                width: 100%;
                height: 100%;
            }
        `
    }

    private async loadPlacement(placement: ImagePlacement): Promise<void> {
        const image = (await placementImageRepository.getByUuid(placement.imageUuid))!

        const loadedImage = await Dom.image(image.src)

        loadedPlacementRepository.add({
            uuid: placement.uuid,
            layerUuid: this.layer.uuid,
            image: loadedImage,
            x: placement.coordinate.x,
            y: placement.coordinate.y,
            width: loadedImage.width,
            height: loadedImage.height,
        })
        Events.emit('placement-added')
    }

    protected async setup(): Promise<void> {
        this.layer = this.parameters.layer
        this.isCollisionLayer = this.layer.type === LAYERS.typeCollision
        this.currentImage = await Dom.image(
            this.isCollisionLayer
                ? CanvasLayer.COLLISION_IMAGE
                : CanvasLayer.DEFAULT_IMAGE
        )

        this.layer.placements.forEach(this.loadPlacement.bind(this))

        this.viewCoordinates.x = this.parameters.userData?.lastViewPosition?.x || 0
        this.viewCoordinates.y = this.parameters.userData?.lastViewPosition?.y || 0
    }

    protected build(): HTMLElement {
        const container = Dom.div('container')
        const canvas = Dom.makeComponent(Canvas2D, { fps: 60 }) as Canvas2D

        this.classList.toggle('active', this.layer.is_active)

        this.currentImage.classList.add('current-image')

        canvas.classList.toggle('hide', !this.layer.is_visible)

        container.append(
            canvas,
            this.currentImage,
        )

        return container
    }

    protected afterBuild(): void {
        this.getCanvas().startAnimation(this.frameFn.bind(this))
    }

    private handleMouseUp(event: MouseEvent): void {
        if (event.button === MIDDLE_BUTTON) {
            this.isMoving = false
            Events.emit('updated-view-coordinates', this.viewCoordinates)
        }
    }

    protected afterPatch(): void {
        this.getCanvas().startAnimation(this.frameFn.bind(this))
    }

    private handleDelete(event: CustomEvent) {
        const canvas = this.findOne('canvas-2d')! as Canvas2D

        if (this.layer.uuid === event.detail as string) {
            canvas.stopAnimation()
            canvas.destroy()
            this.destroy()
        }
    }

    private handleMovement(event: CustomEvent): void {
        const movement = event.detail as Movement

        if (movement.layerUuid !== this.layer.uuid) {
            this.move(movement)
        }
    }

    private move(movement: Movement): void {
        const dx = movement.clientX - movement.lastMousePosition.x
        const dy = movement.clientY - movement.lastMousePosition.y

        this.viewCoordinates.x -= dx
        this.viewCoordinates.y -= dy

        this.lastMousePosition.x = movement.clientX
        this.lastMousePosition.y = movement.clientY
    }

    private getCanvas(): Canvas2D {
        return this.findOne('canvas-2d')! as Canvas2D
    }

    private handleLayerUpdate(event: CustomEvent): void {
        const layer = event.detail as Layer
        const canvas = this.getCanvas()

        if (canvas && this.layer.uuid === layer.uuid) {
            Object.assign(
                this.layer,
                layer,
            )

            canvas.stopAnimation()

            this.patch()
        }
    }

    private frameFn(): void {
        const canvas = this.getCanvas()

        const visible = loadedPlacementRepository.get()
            .filter(loadedPlacement => loadedPlacement.layerUuid === this.layer.uuid)
            .filter(loadedPlacement => {
                return canvas.isRectVisible(
                    this.viewCoordinates,
                    loadedPlacement,
                )
            })

        visible.forEach(loadedPlacement => {
            canvas.drawImage(
                loadedPlacement.image,
                loadedPlacement.x - this.viewCoordinates.x,
                loadedPlacement.y - this.viewCoordinates.y,
                loadedPlacement.image.width,
                loadedPlacement.image.height,
            )
        })
    }

    private snap(value: number): number {
        return Math.floor(value / CanvasLayer.TILE_SIZE) * CanvasLayer.TILE_SIZE
    }

    private handleMouseMove(event: MouseEvent): void {
        const rawX = event.clientX
        const rawY = event.clientY

        const worldX = this.viewCoordinates.x + rawX
        const worldY = this.viewCoordinates.y + rawY

        const snappedWorldX = this.snap(worldX)
        const snappedWorldY = this.snap(worldY)

        const screenX = snappedWorldX - this.viewCoordinates.x
        const screenY = snappedWorldY - this.viewCoordinates.y

        this.mouseCoordinates.x = snappedWorldX
        this.mouseCoordinates.y = snappedWorldY

        const currentImage = this.getCurrentImage()

        if (currentImage) {
            currentImage.classList.remove('hide')
            currentImage.style.left = screenX + 'px'
            currentImage.style.top = screenY + 'px'
        }

        if (this.isMoving) {
            const movement: Movement = {
                layerUuid: this.layer.uuid,
                clientX: event.clientX,
                clientY: event.clientY,
                viewCoordinates: { ...this.viewCoordinates },
                lastMousePosition: { ...this.lastMousePosition },
            }

            this.move(movement)

            Events.emit('moving-in-canvas', movement)
        }
    }


    private async generatePlacement(): Promise<void> {
        if (this.getCurrentImage().src === CanvasLayer.DEFAULT_IMAGE) {
            return
        }
        const newPlacement: ImagePlacement = {
            uuid: crypto.randomUUID(),
            coordinate: {
                x: this.mouseCoordinates.x,
                y: this.mouseCoordinates.y,
            },
            imageUuid: (await placementImageRepository.findOrCreateBySrc(this.getCurrentImage().src)).uuid,
        }

        const lastPlacement = this.layer.placements[this.layer.placements.length - 1]

        if (
            lastPlacement
            && this.snap(lastPlacement.coordinate.x) === this.snap(newPlacement.coordinate.x)
            && this.snap(lastPlacement.coordinate.y) === this.snap(newPlacement.coordinate.y)
            && lastPlacement.imageUuid === newPlacement.imageUuid
        ) {
            return
        }

        this.layer.placements.push(newPlacement)
        this.loadPlacement(newPlacement)
    }

    private handleMouseDown(event: MouseEvent): void {
        if (event.button === LEFT_BUTTON) {
            if (this.toolSelection === 'pencil') {
                this.generatePlacement()

                const mouseMove = (event: MouseEvent) => {
                    this.generatePlacement()
                }

                const mouseUp = (event: MouseEvent) => {
                    Events.emit('layer-placement-made', this.layer)
                    document.removeEventListener('mouseup', mouseUp)
                    document.removeEventListener('mousemove', mouseMove)
                }

                document.addEventListener('mouseup', mouseUp)
                document.addEventListener('mousemove', mouseMove)
            }

            if (this.toolSelection === 'fill') {
                this.performFill(this.mouseCoordinates.x, this.mouseCoordinates.y)
            }
        }

        if (event.button === MIDDLE_BUTTON) {
            this.isMoving = true
            this.lastMousePosition = { x: event.clientX, y: event.clientY }
        }
    }

    private handleMouseLeave(event: MouseEvent): void {
        this.getCurrentImage().classList.add('hide')
    }

    private handleCurrentImageChange(event: CustomEvent): void {
        const newImage = event.detail as HTMLImageElement

        this.getCurrentImage().src = newImage.src
        this.currentImage = newImage
    }

    private async performFill(startX: number, startY: number): Promise<void> {
        const targetX = this.snap(startX)
        const targetY = this.snap(startY)
        const startTile = { x: targetX, y: targetY }

        const canvas = this.findOne('canvas-2d') as Canvas2D

        const canvasWidth = canvas.getBoundingClientRect().width
        const canvasHeight = canvas.getBoundingClientRect().height

        const minX = this.snap(this.viewCoordinates.x)
        const minY = this.snap(this.viewCoordinates.y)
        const maxX = this.snap(this.viewCoordinates.x + canvasWidth)
        const maxY = this.snap(this.viewCoordinates.y + canvasHeight)

        const tileSize = CanvasLayer.TILE_SIZE

        const isInBounds = (x: number, y: number): boolean => {
            return x >= minX && x < maxX && y >= minY && y < maxY
        }

        const existing = this.layer.placements.find(p =>
            p.coordinate.x === startTile.x && p.coordinate.y === startTile.y
        )

        const targetImageUuid = existing?.imageUuid ?? null
        const newImageUuid = (await placementImageRepository.findOrCreateBySrc(this.getCurrentImage().src)).uuid

        // Optimization: avoid unnecessary reprocessing
        if (targetImageUuid === newImageUuid) return

        const visited = new Set<string>()
        const queue: Coordinates[] = [startTile]
        const filledTiles: Coordinates[] = []

        while (queue.length > 0) {
            const { x, y } = queue.pop()!
            const key = `${x},${y}`

            if (visited.has(key) || !isInBounds(x, y)) continue
            visited.add(key)

            const match = this.layer.placements.find(p =>
                p.coordinate.x === x && p.coordinate.y === y
            )

            const matchesTarget = targetImageUuid === null
                ? !match
                : match?.imageUuid === targetImageUuid

            if (!matchesTarget) continue

            filledTiles.push({ x, y })

            queue.push(
                { x: x - tileSize, y },
                { x: x + tileSize, y },
                { x, y: y - tileSize },
                { x, y: y + tileSize },
            )
        }

        if (filledTiles.length === 0) return

        // ✅ Skip if all matched tiles already have the new image
        const allAlreadyCorrect = filledTiles.every(({ x, y }) => {
            const match = this.layer.placements.find(p =>
                p.coordinate.x === x && p.coordinate.y === y
            )
            return match?.imageUuid === newImageUuid
        })

        if (allAlreadyCorrect) return

        // 🔄 Remove old placements in the filled region
        this.layer.placements = this.layer.placements.filter(p => {
            return !filledTiles.some(t => t.x === p.coordinate.x && t.y === p.coordinate.y)
        })

        const fillCanvas = Dom.canvas()
        const fillCtx = fillCanvas.getContext('2d')!

        const offsetX = Math.min(...filledTiles.map(t => t.x))
        const offsetY = Math.min(...filledTiles.map(t => t.y))
        const widthInTiles = Math.max(...filledTiles.map(t => t.x)) - offsetX + tileSize
        const heightInTiles = Math.max(...filledTiles.map(t => t.y)) - offsetY + tileSize

        fillCanvas.width = widthInTiles
        fillCanvas.height = heightInTiles

        filledTiles.forEach(tile => {
            fillCtx.drawImage(
                this.getCurrentImage(),
                tile.x - offsetX,
                tile.y - offsetY,
                tileSize,
                tileSize
            )
        })

        const dataURL = fillCanvas.toDataURL()
        const mergedImageUuid = (await placementImageRepository.findOrCreateBySrc(dataURL)).uuid

        const placement: ImagePlacement = {
            uuid: crypto.randomUUID(),
            coordinate: { x: offsetX, y: offsetY },
            imageUuid: mergedImageUuid,
        }

        this.layer.placements.push(placement)
        await this.loadPlacement(placement)

        Events.emit('layer-placement-made', this.layer)
    }


    private handleToolSelection(event: CustomEvent): void {
        this.toolSelection = event.detail as string
    }

    private getCurrentImage(): HTMLImageElement {
        return this.findOne('.current-image')!
    }

    private handleRequestFocusOnPlacement(event: CustomEvent): void {
        const uuid = event.detail as string
        const targetPlacement = loadedPlacementRepository.getByUuid(uuid)
        const canvas = this.findOne('canvas-2d') as Canvas2D

        if (!targetPlacement || !canvas) return

        const canvasRect = canvas.getBoundingClientRect()

        const targetViewX = targetPlacement.x + targetPlacement.width / 2 - canvasRect.width / 2
        const targetViewY = targetPlacement.y + targetPlacement.height / 2 - canvasRect.height / 2

        const startX = this.viewCoordinates.x
        const startY = this.viewCoordinates.y
        const deltaX = targetViewX - startX
        const deltaY = targetViewY - startY

        const duration = 300
        const startTime = performance.now()

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            const easeOut = 1 - Math.pow(1 - progress, 3)

            this.viewCoordinates.x = startX + deltaX * easeOut
            this.viewCoordinates.y = startY + deltaY * easeOut

            Events.emit('updated-view-coordinates', { ...this.viewCoordinates })

            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }

        requestAnimationFrame(animate)
    }
}