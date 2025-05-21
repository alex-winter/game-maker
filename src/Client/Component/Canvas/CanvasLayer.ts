import { LAYERS } from 'Client/Constants/layers'
import { LEFT_BUTTON, MIDDLE_BUTTON } from 'Client/Constants/mouse-events'
import { Coordinates } from 'Model/Coordinates'
import { LoadedPlacement } from 'Client/Model/LoadedPlacement'
import { ImagePlacement } from 'Client/Model/Placement'
import { Component, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { generateImageDataURL } from 'Client/Service/generate-image'
import { placementImageRepository } from 'Client/Service/Repository/PlacementImageRepository'
import { Layer } from 'Model/Layer'
import { UserData } from 'Model/UserData'
import { Canvas2D } from 'Client/Component/Canvas/Canvas'
import { RGBA } from 'Client/Model/RGB'

type Movement = {
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

    private currentImage!: HTMLImageElement
    private layer!: Layer
    private readonly mouseCoordinates: Coordinates = { x: 0, y: 0 }
    private readonly loadedPlacements: LoadedPlacement[] = []
    private isMoving: boolean = false
    private lastMousePosition: Coordinates = { x: 0, y: 0 }
    private viewCoordinates: Coordinates = { x: 0, y: 0 }
    private isCollisionLayer: boolean = false

    private readonly canvas: Canvas2D = Dom.makeComponent(Canvas2D, { fps: 60 }) as Canvas2D

    protected readonly listeners: Listeners = {
        'got-user-data': this.handleGotUserData,
        'layer-deleted': this.handleDelete,
        'layer-update': this.handleLayerUpdate,
        'moving-in-canvas': this.handleMovement,
        'sheet-selection-made': this.handleCurrentImageChange,
        'window-resize': this.handleWindowResize,
    }

    protected css(): string {
        return /*css*/`
            :host {
                z-index: 500;
                display: block;
                position: absolute;
                top: 0;
                left: 0;
            }
            
            :host(.active) {
                z-index: 501;
            }

            .current-image {
                position: fixed;
                pointer-events: none;
                z-index: 510;
            }

            .hide {
                display: none;
            }
        `
    }

    private async loadPlacement(placement: ImagePlacement): Promise<void> {
        const image = (await placementImageRepository.getByUuid(placement.imageUuid))!

        const loadedImage = await Dom.image(image.src)

        this.loadedPlacements.push({
            image: loadedImage,
            x: placement.coordinate.x,
            y: placement.coordinate.y,
            width: loadedImage.width,
            height: loadedImage.height,
        })
    }

    protected async setup(): Promise<void> {
        this.layer = this.parameters.layer
        this.isCollisionLayer = this.layer.type === LAYERS.typeCollision

        if (this.isCollisionLayer) {
            this.currentImage = await Dom.image(CanvasLayer.COLLISION_IMAGE)
        }

        this.layer.placements.forEach(this.loadPlacement.bind(this))
    }

    protected build(): HTMLElement {
        const container = Dom.div('container')
        const canvas = this.canvas

        canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this))
        canvas.addEventListener('mousedown', this.handleMouseDown.bind(this))
        canvas.addEventListener('mousemove', this.handleMouseMove.bind(this))

        canvas.classList.toggle('hide', !this.layer.is_visible)
        this.classList.toggle('active', this.layer.is_active)

        if (this.isCollisionLayer) {
            container.append(this.currentImage)
            this.currentImage.classList.add('current-image')
        }

        container.append(canvas)

        return container
    }

    protected afterBuild(): void {
        this.handleWindowResize()

        this.canvas.startAnimation(this.frame.bind(this))

        Events.emit('built-canvas-layer')

        this.addEventListener('mouseup', (event: MouseEvent) => {
            if (event.button === MIDDLE_BUTTON) {
                this.isMoving = false
            }
        })
    }

    private handleGotUserData(event: CustomEvent) {
        const userData = event.detail as UserData

        this.viewCoordinates.x = userData.lastViewPosition.x
        this.viewCoordinates.y = userData.lastViewPosition.y
    }

    private handleDelete(event: CustomEvent) {
        if (this.layer.uuid === event.detail as string) {
            this.canvas.stopAnimation()
            this.canvas.destroy()
            this.destroy()
        }
    }

    private handleMovement(event: CustomEvent): void {
        const movement = event.detail as Movement

        const dx = movement.clientX - movement.lastMousePosition.x
        const dy = movement.clientY - movement.lastMousePosition.y

        this.viewCoordinates.x -= dx
        this.viewCoordinates.y -= dy

        this.lastMousePosition.x = movement.clientX
        this.lastMousePosition.y = movement.clientY

        Events.emit('updated-view-coordinates', this.viewCoordinates)
    }

    private handleLayerUpdate(event: CustomEvent): void {
        const layer = event.detail as Layer

        if (this.layer.uuid === layer.uuid) {
            Object.assign(
                this.layer,
                layer,
            )

            this.patch()
        }
    }

    private frame(): void {
        const visible = this.loadedPlacements
            .filter(loadedPlacement => {
                return this.canvas.isRectVisible(
                    this.viewCoordinates,
                    loadedPlacement,
                )
            })


        visible.forEach(loadedPlacement => {
            this.canvas.drawImage(
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

        if (this.currentImage) {
            this.currentImage.classList.remove('hide')
            this.currentImage.style.left = screenX + 'px'
            this.currentImage.style.top = screenY + 'px'
        }

        if (this.isMoving) {
            const movement: Movement = {
                clientX: event.clientX,
                clientY: event.clientY,
                viewCoordinates: { ...this.viewCoordinates },
                lastMousePosition: { ...this.lastMousePosition },
            }

            Events.emit('moving-in-canvas', movement)
        }
    }


    private async generatePlacement(): Promise<void> {
        const placement: ImagePlacement = {
            coordinate: {
                x: this.mouseCoordinates.x,
                y: this.mouseCoordinates.y,
            },
            imageUuid: (await placementImageRepository.findOrCreateBySrc(this.currentImage.src)).uuid,
        }

        const lastPlacement = this.layer.placements[this.layer.placements.length - 1]
        if (JSON.stringify(lastPlacement) === JSON.stringify(placement)) return

        this.layer.placements.push(placement)
        this.loadPlacement(placement)
    }

    private handleMouseDown(event: MouseEvent): void {
        if (event.button === LEFT_BUTTON && this.currentImage) {
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

        if (event.button === MIDDLE_BUTTON) {
            this.isMoving = true
            this.lastMousePosition = { x: event.clientX, y: event.clientY }
        }
    }

    private handleMouseLeave(event: MouseEvent): void {
        this.currentImage?.classList.add('hide')
    }

    private handleCurrentImageChange(event: CustomEvent): void {
        const newImage = event.detail as HTMLImageElement

        if (this.currentImage) {
            this.currentImage.src = newImage.src
        } else {
            this.currentImage = newImage.cloneNode() as HTMLImageElement
            this.findOne('.container')?.append(this.currentImage)
            this.currentImage.classList.add('current-image')
        }
    }

    private handleWindowResize(): void {
        this.canvas.setDimensions({
            width: window.innerWidth,
            height: window.innerHeight,
        })
    }
}