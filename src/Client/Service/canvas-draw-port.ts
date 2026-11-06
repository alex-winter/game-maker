import { DrawPort } from 'engine/draw-port'

/**
 * Adapts a 2D canvas context to the engine's draw port. Smoothing is turned
 * off on every clear because resizing a canvas resets its context state.
 */
export function canvasDrawPort(ctx: CanvasRenderingContext2D): DrawPort<CanvasImageSource> {
    return {
        get width(): number {
            return ctx.canvas.width
        },
        get height(): number {
            return ctx.canvas.height
        },
        clear(): void {
            ctx.imageSmoothingEnabled = false
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        },
        fillRect(x, y, width, height, color): void {
            ctx.fillStyle = color
            ctx.fillRect(x, y, width, height)
        },
        drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh): void {
            ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
        },
    }
}
