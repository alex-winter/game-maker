import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'

export class SheetMaker extends Component {
    private image: HTMLImageElement | null = null

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
        const canvas = Dom.canvas()
        const context = canvas.getContext('2d') as CanvasRenderingContext2D
        const selectorBox = this.buildSelectorBox()

        if (this.image) {
            context.drawImage(this.image, 0, 0)
        }

        element.append(canvas, selectorBox)

        return element
    }

    protected buildSelectorBox(): HTMLDivElement {
        const box = Dom.div('selector-box')

        this.addEventListener('mousedown', (event: MouseEvent) => {
            box.style.left = event.offsetX + 'px'
            box.style.top = event.offsetY + 'px'
        })

        return box
    }
}