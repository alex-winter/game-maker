import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Coordinates, Dimensions, Rect } from 'Model/Coordinates'

export class Canvas2D extends Component {
    private animationTimeout!: number
    private frameFunction!: Function

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
            ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
        } else if (dw !== undefined && dh !== undefined) {
            ctx.drawImage(image, dx, dy, dw, dh)
        } else {
            ctx.drawImage(image, dx, dy)
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
        cameraCoordinates: Coordinates,
        rect: Rect,
    ): boolean {
        const viewLeft = cameraCoordinates.x
        const viewTop = cameraCoordinates.y
        const viewRight = viewLeft + this.getCanvas().width
        const viewBottom = viewTop + this.getCanvas().height

        return !(
            rect.x + rect.width < viewLeft ||
            rect.x > viewRight ||
            rect.y + rect.height < viewTop ||
            rect.y > viewBottom
        )
    }

    public setDimensions(dimensions: Dimensions): void {
        const canvas = this.getCanvas()

        canvas.width = dimensions.width
        canvas.height = dimensions.height
    }

    protected build(): HTMLElement {
        return Dom.canvas()
    }

    private frame = (): void => {
        const ctx = this.getCtx()

        this.clear()

        this.frameFunction(ctx)

        this.animationTimeout = setTimeout(() => {
            window.requestAnimationFrame(this.frame)
        }, 100) as unknown as number
    }

    private clear(): void {
        this.getCtx().clearRect(
            0,
            0,
            this.getCanvas().width,
            this.getCanvas().height,
        )
    }

    private getCanvas(): HTMLCanvasElement {
        return this.findOne('canvas')!
    }

    private getCtx(): CanvasRenderingContext2D {
        return this.getCanvas().getContext('2d')!
    }
}