import { CollisionPlacement, ImagePlacement } from 'Client/Model/Placement'

interface BaseLayer {
    uuid: string

    type: string

    name: string

    created_at: string

    is_visible: boolean

    is_active: boolean
}

export interface Layer extends BaseLayer {

    placements: ImagePlacement[]

}

export interface CollisionsLayer extends BaseLayer {

    placements: CollisionPlacement[]

}