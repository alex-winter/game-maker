/**
 * What the engine needs from a drawing surface. The browser adapts a
 * `CanvasRenderingContext2D`; tests record the calls. `TImage` is opaque to
 * the engine: a decoded sheet in the browser, any token in a test.
 */
/** Just the size of a surface, for code that only needs to know what is visible. */
export type PortSize = {
    /** Size of the surface in pixels. */
    readonly width: number

    readonly height: number
}

export type DrawPort<TImage> = PortSize & {
    clear(): void

    /** Fills a screen rectangle with a CSS colour. Used for stand-ins and overlays, never for tiles. */
    fillRect(x: number, y: number, width: number, height: number, color: string): void

    /** Copies the source rectangle of `image` onto the destination rectangle, without smoothing. */
    drawImage(
        image: TImage,
        sx: number,
        sy: number,
        sw: number,
        sh: number,
        dx: number,
        dy: number,
        dw: number,
        dh: number,
    ): void
}
