import { ImagePlacement } from 'Model/Placement'

/**
 * A legacy placement layer: free images pasted at pixel coordinates. Read-only
 * since T-020; maps painted this way show it as a frozen background. New
 * authoring writes metatiles into `TileMap` (`domain/map.ts`).
 */
export type Layer = {
    uuid: string

    type: string

    name: string

    created_at: string

    is_visible: boolean

    is_active: boolean

    order: number

    placements: ImagePlacement[]
}
