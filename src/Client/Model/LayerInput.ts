import { TileLayerKind } from 'domain/map'

/** What the new-layer form submits. */
export type LayerInput = {
    name: string

    kind: TileLayerKind
}
