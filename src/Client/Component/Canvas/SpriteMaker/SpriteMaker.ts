import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'

export class SpriteMaker extends Component {
    private image: HTMLImageElement | null = null

    protected css(): string {
        return /*css*/`
            canvas {
                width: 400px;
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

        if (this.image) {
            context.drawImage(this.image, 0, 0)
        }

        element.append(canvas)

        return element
    }
}