import { EVENTS } from 'Client/Constants/events'
import { LAYERS } from 'Client/Constants/layers'
import { LEFT_BUTTON, MIDDLE_BUTTON } from 'Client/Constants/mouse-events'
import { Coordinates } from 'Model/Coordinates'
import { LoadedPlacement } from 'Client/Model/LoadedPlacement'
import { ImagePlacement } from 'Client/Model/Placement'
import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { generateImageDataURL } from 'Client/Service/generate-image'
import { placementImageRepository } from 'Client/Service/Repository/PlacementImageRepository'
import { Layer } from 'Model/Layer'

interface Movement {
    clientX: number

    clientY: number

    viewCoordinates: Coordinates

    lastMousePosition: Coordinates
}

export class CanvasLayer extends Component {
    private currentImage!: HTMLImageElement
    private layer!: Layer
    private readonly mouseCoordinates: Coordinates = { x: 0, y: 0 }
    private readonly loadedPlacements: LoadedPlacement[] = []
    private isMoving: boolean = false
    private lastMousePosition: Coordinates = { x: 0, y: 0 }
    private viewCoordinates: Coordinates = { x: 0, y: 0 }
    private scale: number = 1
    private isCollisionLayer: boolean = false

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

        this.loadedPlacements.push({
            image: await Dom.image(image.src),
            x: placement.coordinate.x,
            y: placement.coordinate.y,
        })
    }

    protected async setup(): Promise<void> {
        this.layer = this.parameters.layer
        this.isCollisionLayer = this.layer.type === LAYERS.typeCollision

        if (this.isCollisionLayer) {
            console.log('loading collection layer image')
            this.currentImage = await Dom.image(generateImageDataURL(16, 16, { r: 255, g: 0, b: 0, a: 0.3 }))
        }

        this.layer.placements.forEach(this.loadPlacement.bind(this))
    }

    protected build(): HTMLElement {
        const container = Dom.div('container')
        const canvas = Dom.canvas()

        canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this))
        canvas.addEventListener('mousedown', this.handleMouseDown.bind(this))
        canvas.addEventListener('mousemove', this.handleMouseMove.bind(this))
        canvas.addEventListener('wheel', this.handleWheelZoom.bind(this))

        canvas.classList.toggle('hide', !this.layer.is_visible)
        this.classList.toggle('active', this.layer.is_active)

        if (this.isCollisionLayer) {
            console.log('appending image to container')
            container.append(this.currentImage)
            this.currentImage.classList.add('current-image')
        }

        this.handleWindowResize(canvas)

        container.append(canvas)

        return container
    }

    private handleWheelZoom(event: WheelEvent): void {
        event.preventDefault()

        Events.emit('canvas-layer-zoom', event)
    }

    protected afterBuild(): void {
        Events.listen(() => this.handleWindowResize(), EVENTS.windowResize)
        Events.listen(this.handleCurrentImageChange.bind(this), EVENTS.sheetSelectionMade)
        Events.listen(this.handleLayerUpdate.bind(this), 'layer-update')
        Events.listen(this.handleMovement.bind(this), 'moving-in-canvas')
        Events.listen((event: CustomEvent) => {
            const wheelEvent = event.detail as WheelEvent
            const zoomIntensity = 0.1
            const mouseX = wheelEvent.clientX
            const mouseY = wheelEvent.clientY

            const worldX = this.viewCoordinates.x + mouseX / this.scale
            const worldY = this.viewCoordinates.y + mouseY / this.scale

            if (wheelEvent.deltaY < 0) {
                this.scale *= (1 + zoomIntensity)
            } else {
                this.scale *= (1 - zoomIntensity)
            }

            this.scale = Math.max(0.1, Math.min(this.scale, 5))

            this.viewCoordinates.x = worldX - mouseX / this.scale
            this.viewCoordinates.y = worldY - mouseY / this.scale

            this.currentImage.style.transform = `scale(${this.scale})`
        }, 'canvas-layer-zoom')
        Events.listen((event: CustomEvent) => {
            if (this.layer.uuid === event.detail as string) {
                this.destroy()
            }
        }, 'layer-deleted')

        this.addEventListener('mouseup', () => {
            this.isMoving = false
        })

        this.frame()
    }

    private handleMovement(event: CustomEvent): void {
        const movement = event.detail as Movement
        const dx = movement.clientX - movement.lastMousePosition.x
        const dy = movement.clientY - movement.lastMousePosition.y

        this.viewCoordinates.x -= dx / this.scale
        this.viewCoordinates.y -= dy / this.scale

        this.lastMousePosition.x = movement.clientX
        this.lastMousePosition.y = movement.clientY
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

    private drawPlacement(loadedPlacement: LoadedPlacement): void {
        this.getCtx().drawImage(
            loadedPlacement.image,
            (loadedPlacement.x - this.viewCoordinates.x) * this.scale,
            (loadedPlacement.y - this.viewCoordinates.y) * this.scale,
            loadedPlacement.image.width * this.scale,
            loadedPlacement.image.height * this.scale,
        )
    }

    private isPlacementVisible(p: LoadedPlacement): boolean {
        const viewLeft = this.viewCoordinates.x
        const viewTop = this.viewCoordinates.y
        const viewRight = viewLeft + this.getCanvas().width / this.scale
        const viewBottom = viewTop + this.getCanvas().height / this.scale

        return !(p.x + p.image.width < viewLeft ||
            p.x > viewRight ||
            p.y + p.image.height < viewTop ||
            p.y > viewBottom)
    }

    private frame(): void {
        setTimeout(() => {
            const ctx = this.getCtx()
            ctx.clearRect(0, 0, this.getCanvas().width, this.getCanvas().height)

            const visible = this.loadedPlacements.filter(this.isPlacementVisible.bind(this))
            visible.forEach(this.drawPlacement.bind(this))

            window.requestAnimationFrame(this.frame.bind(this))
        }, 100)
    }

    private snap(value: number): number {
        return Math.floor(value / 16) * 16
    }

    private handleMouseMove(event: MouseEvent): void {
        const rawX = event.clientX
        const rawY = event.clientY

        const worldX = this.viewCoordinates.x + rawX / this.scale
        const worldY = this.viewCoordinates.y + rawY / this.scale

        const snappedWorldX = this.snap(worldX)
        const snappedWorldY = this.snap(worldY)

        const screenX = (snappedWorldX - this.viewCoordinates.x) * this.scale
        const screenY = (snappedWorldY - this.viewCoordinates.y) * this.scale

        this.mouseCoordinates.x = snappedWorldX
        this.mouseCoordinates.y = snappedWorldY

        if (this.currentImage) {
            console.log('moving')
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
                Events.emit(EVENTS.layerPlacementMade, this.layer)
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

    private getCanvas(): HTMLCanvasElement {
        return this.shadowRoot!.querySelector('canvas')!
    }

    private getCtx(): CanvasRenderingContext2D {
        return this.getCanvas().getContext('2d')!
    }

    private handleWindowResize(canvas: HTMLCanvasElement | undefined = undefined): void {
        const currentCanvas = canvas || this.getCanvas()
        currentCanvas.width = window.outerWidth
        currentCanvas.height = window.outerHeight
    }
}