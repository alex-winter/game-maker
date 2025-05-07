import { EVENTS } from 'Client/Constants/events'
import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'

export class CanvasLayer extends Component {
    private readonly canvas: HTMLCanvasElement = Dom.canvas()
    private readonly ctx: CanvasRenderingContext2D = this.canvas.getContext('2d')!
    private currentImage: HTMLImageElement | undefined

    protected build(): HTMLElement {
        Events.listen(this.handleWindowResize.bind(this), EVENTS.windowResize)
        Events.listen(this.handleCurrentImageChange.bind(this), EVENTS.sheetSelectionMade)

        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this))

        this.handleWindowResize()

        return this.canvas
    }

    private handleMouseDown(event: MouseEvent): void {
        this.ctx.drawImage(
            this.currentImage!,
            event.clientX,
            event.clientY,
        )

        const mouseMove = (event: MouseEvent) => {

        }

        const mouseUp = (event: MouseEvent) => {
            document.removeEventListener('mouseup', mouseUp)
            document.removeEventListener('mousemove', mouseMove)
        }

        document.addEventListener('mousemove', mouseMove)
        document.addEventListener('mouseup', mouseUp)
    }

    private handleCurrentImageChange(event: CustomEvent): void {
        this.currentImage = event.detail as HTMLImageElement
    }

    private handleWindowResize(): void {
        this.canvas.width = window.outerWidth
        this.canvas.height = window.outerHeight
    }
}