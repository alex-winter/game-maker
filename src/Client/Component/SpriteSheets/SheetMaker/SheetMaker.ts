import { EVENTS } from 'Client/Constants/events'
import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { extractImageFromCanvasArea } from 'Client/Service/extract-image-from-canvas-area'

export class SheetMaker extends Component {
    private image: HTMLImageElement | null = null
    private canvas!: HTMLCanvasElement

    protected css(): string {
        return /*css*/`
            :host {
                position: relative;
            }

            canvas {
                width: 400px;
            }

            .selector-box {
                position: absolute;
                color
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
        this.canvas = Dom.canvas()
        const context = this.canvas.getContext('2d')!
        const selectorBox = this.buildSelectorBox()

        if (this.image) {
            context.drawImage(this.image, 0, 0)
        }

        element.append(this.canvas, selectorBox)

        return element
    }

    protected buildSelectorBox(): HTMLDivElement {
        const box = Dom.div('selector-box')

        box.style.position = 'absolute'
        box.style.border = '1px solid #0078D7'
        box.style.backgroundColor = 'rgba(0, 120, 215, 0.2)'
        box.style.pointerEvents = 'none'
        box.style.display = 'none'
        box.style.zIndex = '10'

        let startX = 0
        let startY = 0
        let isDragging = false

        const snap = (value: number) => Math.round(value / 5) * 5

        const onMouseMove = (event: MouseEvent) => {
            if (!isDragging) return

            const rect = this.getBoundingClientRect()
            const currentX = event.clientX - rect.left
            const currentY = event.clientY - rect.top

            const width = snap(Math.abs(currentX - startX))
            const height = snap(Math.abs(currentY - startY))

            box.style.display = 'block'
            box.style.left = snap(Math.min(currentX, startX)) + 'px'
            box.style.top = snap(Math.min(currentY, startY)) + 'px'
            box.style.width = width + 'px'
            box.style.height = height + 'px'
        }

        const onMouseUp = async () => {
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

        this.addEventListener('mousedown', (event: MouseEvent) => {
            const rect = this.getBoundingClientRect()
            isDragging = true
            startX = event.clientX - rect.left
            startY = event.clientY - rect.top

            box.style.display = 'none'

            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)
        })

        return box
    }

}