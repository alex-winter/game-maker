import { Coordinates } from '../../domain/coordinates'
import { clampZoom, View, zoomedAt } from '../../engine/view'

/**
 * The one editor camera: position in world pixels plus an integer zoom.
 * Every listener reads it on each frame, so panning and zooming never have
 * to be copied between components.
 */
export class Camera {
    private readonly view: { x: number; y: number; zoom: number } = { x: 0, y: 0, zoom: 1 }

    public get(): View {
        return { x: this.view.x, y: this.view.y, zoom: this.view.zoom }
    }

    /** Moves the camera; zoom is kept unless the position carries one. */
    public set(position: Coordinates & { zoom?: number }): void {
        this.view.x = position.x
        this.view.y = position.y

        if (position.zoom !== undefined) {
            this.view.zoom = clampZoom(position.zoom)
        }
    }

    /** Pans by a world-pixel delta. Callers converting from screen pixels divide by `zoom` first. */
    public panBy(dx: number, dy: number): void {
        this.view.x += dx
        this.view.y += dy
    }

    /** Zooms toward `anchor`, a screen pixel inside the canvas, so what is under the cursor stays put. */
    public zoomTo(zoom: number, anchor: Coordinates): void {
        this.set(zoomedAt(this.get(), zoom, anchor))
    }
}

export const camera = new Camera()
