import { Placement } from 'Client/Model/Placement'

export interface Layer {
    uuid: string

    name: string

    created_at: string

    is_visible: boolean

    is_active: boolean

    placements: Placement[]
}