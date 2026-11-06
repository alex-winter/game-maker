import { Coordinates } from 'Model/Coordinates'

/**
 * The one editor camera. Every layer reads it on each frame, so panning
 * never has to be copied between layers. T-017 moves this into the engine.
 */
export class Camera {
    private readonly position: Coordinates = { x: 0, y: 0 }

    public get(): Coordinates {
        return {
            x: this.position.x,
            y: this.position.y,
        }
    }

    public set(position: Coordinates): void {
        this.position.x = position.x
        this.position.y = position.y
    }

    public panBy(dx: number, dy: number): void {
        this.position.x += dx
        this.position.y += dy
    }
}

export const camera = new Camera()
