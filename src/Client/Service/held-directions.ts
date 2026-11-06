import { Direction } from '../../domain/movement'

/**
 * The directions currently held, in press order. The most recent press is
 * the one that moves the player, as on a d-pad where the newest press wins;
 * releasing it falls back to whatever is still held.
 */
export class HeldDirections {
    private readonly order: Direction[] = []

    press(direction: Direction): void {
        this.release(direction)
        this.order.push(direction)
    }

    release(direction: Direction): void {
        const index = this.order.indexOf(direction)

        if (index !== -1) {
            this.order.splice(index, 1)
        }
    }

    clear(): void {
        this.order.length = 0
    }

    /** The direction that should move the player, or null when nothing is held. */
    latest(): Direction | null {
        return this.order.length === 0 ? null : this.order[this.order.length - 1]
    }
}
