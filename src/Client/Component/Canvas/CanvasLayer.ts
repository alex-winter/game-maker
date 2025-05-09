import { EVENTS } from 'Client/Constants/events'
import { LEFT_BUTTON } from 'Client/Constants/mouse-events'
import { Coordinate } from 'Client/Model/Coordinate'
import { Placement } from 'Client/Model/Placement'
import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { Layer } from 'Model/Layer'

export class CanvasLayer extends Component {
    private canvas!: HTMLCanvasElement
    private ctx!: CanvasRenderingContext2D
    private currentImage: HTMLImageElement | undefined
    private layer!: Layer
    private isLeftMouseDown: boolean = false
    private readonly mouseCoordinates: Coordinate = { x: 0, y: 0 }

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

    protected async setup(): Promise<void> {
        this.layer = this.parameters.layer
    }

    protected build(): HTMLElement {
        this.canvas = Dom.canvas()
        this.ctx = this.canvas.getContext('2d')!

        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this))
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this))

        if (!this.layer.is_visible) {
            this.canvas.classList.add('hide')
        }

        this.handleWindowResize()

        return this.canvas
    }

    protected after(): void {
        Events.listen(this.handleWindowResize.bind(this), EVENTS.windowResize)
        Events.listen(this.handleCurrentImageChange.bind(this), EVENTS.sheetSelectionMade)
        Events.listen(this.handleCheckActive.bind(this), EVENTS.layerActive)
        Events.listen(this.handleLayerUpdate.bind(this), 'layer-update')

        this.frame()
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

    private drawPlacement(placement: Placement): void {
        Dom.image(placement.imageSrc).then(image => {
            this.ctx.drawImage(
                image,
                placement.coordinate.x,
                placement.coordinate.y,
            )
        })
    }

    private frame(): void {
        setTimeout(
            () => {
                this.layer.placements.forEach(this.drawPlacement.bind(this))

                window.requestAnimationFrame(this.frame.bind(this))
            },
            100
        )
    }

    private handleCheckActive(event: CustomEvent): void {
        const layer = event.detail as Layer

        if (layer.uuid === this.layer.uuid) {
            this.classList.add('active')
        } else {
            this.classList.remove('active')
        }
    }

    private handleMouseMove(event: MouseEvent): void {
        const x = event.clientX
        const y = event.clientY

        this.mouseCoordinates.x = x
        this.mouseCoordinates.y = y

        if (this.currentImage) {
            this.currentImage.style.left = x + 'px'
            this.currentImage.style.top = y + 'px'
        }
    }

    private handleMouseDown(event: MouseEvent): void {
        if (event.button === LEFT_BUTTON) {
            this.isLeftMouseDown = true

            const placement = {
                coordinate: {
                    x: this.mouseCoordinates.x,
                    y: this.mouseCoordinates.y,
                },
                imageSrc: this.currentImage!.src,
            }

            this.layer.placements.push(placement)

            const mouseUp = (event: MouseEvent) => {
                Events.emit(EVENTS.layerPlacementMade, this.layer)
                document.removeEventListener('mouseup', mouseUp)
            }

            document.addEventListener('mouseup', mouseUp)
        }
    }

    private handleCurrentImageChange(event: CustomEvent): void {
        const newImage = event.detail as HTMLImageElement

        console.log(newImage)

        if (this.currentImage) {
            this.currentImage.src = newImage.src
        } else {
            this.currentImage = newImage
            this.shadowRoot!.append(newImage)
        }

        this.currentImage.classList.add('current-image')
    }

    private handleWindowResize(): void {
        this.canvas.width = window.outerWidth
        this.canvas.height = window.outerHeight
    }
}