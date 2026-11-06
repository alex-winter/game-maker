const DEFAULT_FPS = 30

/** Milliseconds between frames for `fps`. Anything that is not a positive finite number means 30 fps. */
export function frameDelayMs(fps: unknown): number {
    const framesPerSecond = typeof fps === 'number' && Number.isFinite(fps) && fps > 0
        ? fps
        : DEFAULT_FPS

    return Math.round(1000 / framesPerSecond)
}
