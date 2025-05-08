import { EVENTS } from 'Client/Constants/events'
import { LEFT_BUTTON } from 'Client/Constants/mouse-events'
import { Coordinate } from 'Client/Model/Coordinate'
import { Placement } from 'Client/Model/Placement'
import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { Layer } from 'Model/Layer'

export class CanvasLayer extends Component {
    private readonly canvas: HTMLCanvasElement = Dom.canvas()
    private readonly ctx: CanvasRenderingContext2D = this.canvas.getContext('2d')!
    private currentImage: HTMLImageElement | undefined
    private layer!: Layer
    private isLeftMouseDown: boolean = false
    private readonly mouseCoordinates: Coordinate = { x: 0, y: 0 }

    protected css(): string {
        return /*css*/`
            .current-image {
                position: fixed;
                pointer-events: none;
            }
        `
    }

    protected build(): HTMLElement {
        this.layer = this.parameters.layer

        Events.listen(this.handleWindowResize.bind(this), EVENTS.windowResize)
        Events.listen(this.handleCurrentImageChange.bind(this), EVENTS.sheetSelectionMade)

        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this))
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this))

        this.handleWindowResize()


        this.frame()

        return this.canvas
    }

    private drawPlacement(placement: Placement): void {
        this.ctx.drawImage(
            placement.image,
            placement.coordinate.x,
            placement.coordinate.y,
        )
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

            this.layer.placements.push({
                coordinate: {
                    x: this.mouseCoordinates.x,
                    y: this.mouseCoordinates.y,
                },
                image: this.currentImage!,
            })

            const mouseUp = (event: MouseEvent) => {
                document.removeEventListener('mouseup', mouseUp)
            }

            document.addEventListener('mouseup', mouseUp)
        }
    }

    private handleCurrentImageChange(event: CustomEvent): void {
        const newImage = event.detail as HTMLImageElement

        if (this.currentImage) {
            this.shadowRoot!.replaceChild(this.currentImage, newImage)
        } else {
            this.shadowRoot!.append(newImage)
        }

        this.currentImage = newImage

        this.currentImage.classList.add('current-image')
    }

    private handleWindowResize(): void {
        this.canvas.width = window.outerWidth
        this.canvas.height = window.outerHeight
    }
}