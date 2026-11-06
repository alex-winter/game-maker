/** Milliseconds for each half of a transition: fade out, then fade in. */
export const FADE_MS = 200

/**
 * A screen fade in progress. `out` darkens toward black; when it completes
 * the host swaps the map and the fade turns to `in`, which lifts again.
 */
export type Fade = {
    readonly phase: 'out' | 'in'

    readonly elapsedMs: number

    readonly durationMs: number
}

export function startFade(durationMs: number = FADE_MS): Fade {
    return { phase: 'out', elapsedMs: 0, durationMs }
}

/**
 * The fade after `deltaMs`. `swap` is true on the one frame the fade-out
 * completes: the moment the screen is black and the map should change.
 * A finished fade-in becomes null.
 */
export function advanceFade(fade: Fade, deltaMs: number): { readonly fade: Fade | null; readonly swap: boolean } {
    const elapsedMs = fade.elapsedMs + deltaMs

    if (elapsedMs < fade.durationMs) {
        return { fade: { ...fade, elapsedMs }, swap: false }
    }

    if (fade.phase === 'out') {
        return { fade: { phase: 'in', elapsedMs: 0, durationMs: fade.durationMs }, swap: true }
    }

    return { fade: null, swap: false }
}

/** How dark the screen is, 0 (clear) to 1 (black). */
export function fadeOpacity(fade: Fade | null): number {
    if (fade === null) {
        return 0
    }

    const t = Math.min(1, fade.elapsedMs / fade.durationMs)

    return fade.phase === 'out' ? t : 1 - t
}
