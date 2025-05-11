import { EVENTS } from 'Client/Constants/events'
import { LEFT_BUTTON } from 'Client/Constants/mouse-events'
import { Coordinate } from 'Client/Model/Coordinate'
import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { Layer } from 'Model/Layer'

interface LoadedPlacement {
    image: HTMLImageElement
    x: number
    y: number
}

export class CanvasLayer extends Component {
    private currentImage!: HTMLImageElement
    private layer!: Layer
    private readonly mouseCoordinates: Coordinate = { x: 0, y: 0 }
    private readonly loadedPlacements: LoadedPlacement[] = []

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

        this.layer.placements.forEach(async placement => {
            this.loadedPlacements.push({
                image: await Dom.image(placement.imageSrc),
                x: placement.coordinate.x,
                y: placement.coordinate.y,
            })
        })
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

    private drawPlacement(loadedPlacement: LoadedPlacement): void {
        this.getCtx().drawImage(
            loadedPlacement.image,
            loadedPlacement.x,
            loadedPlacement.y,
        )
    }

    private frame(): void {
        setTimeout(() => {
            this.loadedPlacements.forEach(this.drawPlacement.bind(this))

            window.requestAnimationFrame(this.frame.bind(this))
        }, 100)
    }

    private handleMouseMove(event: MouseEvent): void {
        const x = event.clientX
        const y = event.clientY

        this.mouseCoordinates.x = x
        this.mouseCoordinates.y = y

        if (this.currentImage) {
            this.currentImage.classList.remove('hide')
            this.currentImage.style.left = x + 'px'
            this.currentImage.style.top = y + 'px'
        }
    }

    private handleMouseDown(event: MouseEvent): void {
        if (event.button === LEFT_BUTTON && this.currentImage) {
            const placement = {
                coordinate: {
                    x: this.mouseCoordinates.x,
                    y: this.mouseCoordinates.y,
                },
                imageSrc: this.currentImage.src,
            }

            this.layer.placements.push(placement)

            const mouseUp = (event: MouseEvent) => {
                Events.emit(EVENTS.layerPlacementMade, this.layer)
                document.removeEventListener('mouseup', mouseUp)
            }

            document.addEventListener('mouseup', mouseUp)
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