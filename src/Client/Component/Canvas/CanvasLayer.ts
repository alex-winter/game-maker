import { EVENTS } from 'Client/Constants/events'
import { LEFT_BUTTON, MIDDLE_BUTTON } from 'Client/Constants/mouse-events'
import { Coordinate } from 'Client/Model/Coordinate'
import { Placement } from 'Client/Model/Placement'
import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { Layer } from 'Model/Layer'

interface LoadedPlacement {
    image: HTMLImageElement
    x: number
    y: number
}

interface Movement {
    clientX: number

    clientY: number

    viewCoordinates: Coordinate

    lastMousePosition: Coordinate

}

export class CanvasLayer extends Component {
    private currentImage!: HTMLImageElement
    private layer!: Layer
    private readonly mouseCoordinates: Coordinate = { x: 0, y: 0 }
    private readonly loadedPlacements: LoadedPlacement[] = []
    private isMoving: boolean = false
    private lastMousePosition: Coordinate = { x: 0, y: 0 }
    private viewCoordinates: Coordinate = { x: 0, y: 0 }

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
            }

            .hide {
                display: none;
            }
        `
    }

    private async loadPlacement(placement: Placement): Promise<void> {
        this.loadedPlacements.push({
            image: await Dom.image(placement.imageSrc),
            x: placement.coordinate.x,
            y: placement.coordinate.y,
        })
    }

    protected async setup(): Promise<void> {
        this.layer = this.parameters.layer

        this.layer.placements.forEach(this.loadPlacement.bind(this))
    }

    protected build(): HTMLElement {
        const canvas = Dom.canvas()

        canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this))
        canvas.addEventListener('mousedown', this.handleMouseDown.bind(this))
        canvas.addEventListener('mousemove', this.handleMouseMove.bind(this))

        canvas.classList.toggle('hide', !this.layer.is_visible)
        this.classList.toggle('active', this.layer.is_active)

        this.handleWindowResize(canvas)

        return canvas
    }

    protected afterBuild(): void {
        Events.listen(() => this.handleWindowResize(), EVENTS.windowResize)
        Events.listen(this.handleCurrentImageChange.bind(this), EVENTS.sheetSelectionMade)
        Events.listen(this.handleLayerUpdate.bind(this), 'layer-update')
        Events.listen(this.handleMovement.bind(this), 'moving-in-canvas')

        this.addEventListener('mouseup', () => {
            this.isMoving = false
        })

        this.frame()
    }

    private handleMovement(event: CustomEvent): void {
        const movement = event.detail as Movement
        const dx = movement.clientX - movement.lastMousePosition.x
        const dy = movement.clientY - movement.lastMousePosition.y

        this.viewCoordinates.x -= dx
        this.viewCoordinates.y -= dy

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
            loadedPlacement.x - this.viewCoordinates.x,
            loadedPlacement.y - this.viewCoordinates.y,
        )
    }

    private frame(): void {
        setTimeout(() => {
            this.getCtx().clearRect(0, 0, this.getCanvas().width, this.getCanvas().height)

            this.loadedPlacements.forEach(this.drawPlacement.bind(this))

            window.requestAnimationFrame(this.frame.bind(this))
        }, 100)
    }

    private snap(value: number): number {
        return Math.floor(value / 16) * 16
    }

    private handleMouseMove(event: MouseEvent): void {
        const rawX = event.clientX
        const rawY = event.clientY

        const snappedX = this.snap(rawX)
        const snappedY = this.snap(rawY)

        this.mouseCoordinates.x = snappedX
        this.mouseCoordinates.y = snappedY

        if (this.currentImage) {
            this.currentImage.classList.remove('hide')
            this.currentImage.style.left = snappedX + 'px'
            this.currentImage.style.top = snappedY + 'px'
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

    private generatePlacement() {
        const placement = {
            coordinate: {
                x: this.snap(this.mouseCoordinates.x) + this.viewCoordinates.x,
                y: this.snap(this.mouseCoordinates.y) + this.viewCoordinates.y,
            },
            imageSrc: this.currentImage.src,
        }

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
            this.shadowRoot!.append(this.currentImage)
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