import { EVENTS } from 'Client/Constants/events'
import { LEFT_BUTTON } from 'Client/Constants/mouse-events'
import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { extractImageFromCanvasArea } from 'Client/Service/extract-image-from-canvas-area'

export class SheetViewer extends Component {
    private image: HTMLImageElement | null = null
    private canvas!: HTMLCanvasElement

    protected css(): string {
        return /*css*/`
            :host {
                position: relative;
                display: block;
            }

            .selector-box {
                position: absolute;
                border: 1px solid #0078D7;
                background-color: rgba(0, 120, 215, 0.2);
                pointer-events: none;
                display: none;
                z-index: 10;
            }
        `
    }

    protected async setup(): Promise<void> {
        if (this.dataset.imageSrc) {
            this.image = await Dom.image(this.dataset.imageSrc as string)
        }
    }

    protected build(): HTMLElement {
        const element = Dom.div()
        this.canvas = Dom.canvas(
            element.offsetHeight,
            element.offsetWidth,
        )
        const context = this.canvas.getContext('2d')!
        const selectorBox = this.buildSelectorBox()

        if (this.image) {
            this.canvas.width = this.image.width
            this.canvas.height = this.image.height

            context.drawImage(this.image, 0, 0)
        }

        element.append(this.canvas, selectorBox)

        return element
    }

    protected buildSelectorBox(): HTMLDivElement {
        const box = Dom.div('selector-box')

        let startX = 0
        let startY = 0
        let isDragging = false

        const snap = (value: number) => Math.round(value / 16) * 16

        const onMouseMove = (event: MouseEvent) => {
            if (!isDragging) return

            const rect = this.getBoundingClientRect()
            const currentX = event.clientX - rect.left + this.scrollLeft
            const currentY = event.clientY - rect.top + this.scrollTop

            const width = snap(Math.abs(currentX - startX))
            const height = snap(Math.abs(currentY - startY))

            box.style.display = 'block'
            box.style.left = snap(Math.min(currentX, startX)) + 'px'
            box.style.top = snap(Math.min(currentY, startY)) + 'px'
            box.style.width = width + 'px'
            box.style.height = height + 'px'
        }

        const onMouseUp = async (event: MouseEvent) => {
            if (event.button === LEFT_BUTTON) {
                isDragging = false
                document.removeEventListener('mousemove', onMouseMove)
                document.removeEventListener('mouseup', onMouseUp)

                const boxX = parseInt(box.style.left || '0', 10)
                const boxY = parseInt(box.style.top || '0', 10)
                const boxWidth = parseInt(box.style.width || '0', 10)
                const boxHeight = parseInt(box.style.height || '0', 10)

                Events.emit(
                    EVENTS.sheetSelectionMade,
                    await extractImageFromCanvasArea(
                        this.canvas,
                        boxX,
                        boxY,
                        boxWidth,
                        boxHeight
                    )
                )
            }
        }

        this.addEventListener('mousedown', (event: MouseEvent) => {
            if (event.button === LEFT_BUTTON) {
                const rect = this.getBoundingClientRect()
                isDragging = true
                startX = event.clientX - rect.left + this.scrollLeft
                startY = event.clientY - rect.top + this.scrollTop

                box.style.display = 'none'

                document.addEventListener('mousemove', onMouseMove)
                document.addEventListener('mouseup', onMouseUp)
            }
        })

        return box
    }

}