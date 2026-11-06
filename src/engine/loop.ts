export type FrameCallback = (deltaSeconds: number) => void

/** `requestAnimationFrame`'s shape, so a test can drive the loop by hand. */
export type FrameScheduler = (callback: (now: number) => void) => unknown

/** Longer gaps (a hidden tab) are clamped so one frame cannot jump the world. */
const MAX_DELTA_SECONDS = 0.1

/**
 * Runs `frame` once per scheduled animation frame with the clamped seconds
 * since the previous one. Returns a function that stops the loop.
 */
export function startLoop(frame: FrameCallback, schedule: FrameScheduler): () => void {
    let running = true
    let lastNow: number | undefined

    const tick = (now: number): void => {
        if (!running) {
            return
        }

        const deltaSeconds = lastNow === undefined ? 0 : Math.min((now - lastNow) / 1000, MAX_DELTA_SECONDS)

        lastNow = now
        frame(deltaSeconds)

        schedule(tick)
    }

    schedule(tick)

    return () => {
        running = false
    }
}
