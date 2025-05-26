import { Component, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Coordinates, Rect } from 'Model/Coordinates'

export class Canvas2D extends Component {
    private animationTimeout!: number
    private frameFunction!: Function
    private msPerFrame: number = 100

    protected listeners: Listeners = {
        'window-resize': this.handleResize
    }

    protected css(): string {
        return /*css*/`
            :host {
                display: block;
                width: 100%;
                height: 100%;
            }
            :host(.hide) {
                visibility: hidden;
                pointer-events: none;
            }
        `
    }

    public drawImage(
        image: CanvasImageSource,
        dx: number,
        dy: number,
        dw?: number,
        dh?: number,
        sx?: number,
        sy?: number,
        sw?: number,
        sh?: number
    ): void {
        const ctx = this.getCtx()

        if (
            sx !== undefined &&
            sy !== undefined &&
            sw !== undefined &&
            sh !== undefined &&
            dw !== undefined &&
            dh !== undefined
        ) {
            ctx?.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
        } else if (dw !== undefined && dh !== undefined) {
            ctx?.drawImage(image, dx, dy, dw, dh)
        } else {
            ctx?.drawImage(image, dx, dy)
        }
    }

    public drawDebugRect(rect: Rect): void {
        const ctx = this.getCtx()

        if (ctx) {
            ctx.strokeStyle = 'red'
            ctx.lineWidth = 1
            ctx.strokeRect(
                rect.x,
                rect.y,
                rect.width,
                rect.height,
            )
        }
    }

    public startAnimation(frameFunction: Function): void {
        this.frameFunction = frameFunction
        this.frame()
    }

    public stopAnimation(): void {
        clearTimeout(this.animationTimeout)
    }

    public isRectVisible(
        viewCoordinates: Coordinates,
        rect: Rect,
    ): boolean {
        const viewLeft = viewCoordinates.x
        const viewTop = viewCoordinates.y
        const viewRight = viewLeft + this.getCanvas().width
        const viewBottom = viewTop + this.getCanvas().height

        return !(
            rect.x + rect.width < viewLeft ||
            rect.x > viewRight ||
            rect.y + rect.height < viewTop ||
            rect.y > viewBottom
        )
    }

    protected async setup(): Promise<void> {
        this.msPerFrame = 1000 / this.parameters.fps | 30
    }

    protected build(): HTMLElement {
        console.log('canvas build')
        const canvas = Dom.canvas()

        canvas.width = this.offsetWidth
        canvas.height = this.offsetHeight

        return canvas
    }

    protected afterBuild(): void {
        this.handleResize()
        console.log('canvas after build')
    }

    private handleResize(): void {
        const canvas = this.findOne('canvas')! as HTMLCanvasElement
        console.log(this.offsetHeight)
        canvas.width = this.offsetWidth
        canvas.height = this.offsetHeight
    }

    private frame = (): void => {
        const ctx = this.getCtx()

        if (ctx) {
            this.clear()

            this.frameFunction(ctx)

            this.animationTimeout = setTimeout(
                () => window.requestAnimationFrame(this.frame),
                this.msPerFrame,
            ) as unknown as number
        } else {
            setTimeout(
                () => window.requestAnimationFrame(this.frame),
                this.msPerFrame,
            )
        }
    }

    private clear(): void {
        this.getCtx()?.clearRect(
            0,
            0,
            this.getCanvas().width,
            this.getCanvas().height,
        )
    }

    private getCanvas(): HTMLCanvasElement {
        return this.findOne('canvas')!
    }

    private getCtx(): CanvasRenderingContext2D | null {
        return this.getCanvas()?.getContext('2d')
    }
}