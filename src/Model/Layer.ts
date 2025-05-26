import { CollisionPlacement, ImagePlacement } from 'Client/Model/Placement'

type BaseLayer = {
    uuid: string

    type: string

    name: string

    created_at: string

    is_visible: boolean

    is_active: boolean

    order: number
}

export type Layer = BaseLayer & {

    placements: ImagePlacement[]

}

export interface CollisionsLayer extends BaseLayer {

    placements: CollisionPlacement[]

}