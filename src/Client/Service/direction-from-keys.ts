import { Coordinates } from 'domain/coordinates'

export type HeldKeys = {
    readonly up: boolean

    readonly down: boolean

    readonly left: boolean

    readonly right: boolean
}

/** Unit-per-axis direction for the held arrows. Opposite keys cancel. */
export function directionFromKeys(keys: HeldKeys): Coordinates {
    return {
        x: (keys.right ? 1 : 0) - (keys.left ? 1 : 0),
        y: (keys.down ? 1 : 0) - (keys.up ? 1 : 0),
    }
}
