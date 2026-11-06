/**
 * What the engine needs from a drawing surface. The browser adapts a
 * `CanvasRenderingContext2D`; tests record the calls. `TImage` is opaque to
 * the engine: a decoded sheet in the browser, any token in a test.
 */
export type DrawPort<TImage> = {
    /** Size of the surface in pixels. */
    readonly width: number

    readonly height: number

    clear(): void

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
