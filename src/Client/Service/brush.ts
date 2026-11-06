import { Events } from 'Client/Service/Events'
import { Id } from 'domain/id'
import { MetatileId } from 'domain/tileset'

/** What the pencil puts down: one metatile of one tileset. */
export type Brush = {
    readonly tilesetId: Id

    readonly metatileId: MetatileId
}

export const BRUSH_CHANGED = 'brush-changed'

/** The editor's current brush. Listeners hear `brush-changed` with the new value. */
class BrushState {
    private current: Brush | undefined

    public get(): Brush | undefined {
        return this.current
    }

    public set(brush: Brush | undefined): void {
        this.current = brush
        Events.emit(BRUSH_CHANGED, brush)
    }
}

export const brush = new BrushState()
