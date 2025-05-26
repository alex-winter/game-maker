import { Coordinates } from 'Model/Coordinates'

export type PlacementImage = {

    uuid: string

    src: string

}

export type Placement = {
    uuid: string
}


export type CollisionPlacement = Placement & {

    coordinate: Coordinates

}

export type ImagePlacement = Placement & {

    coordinate: Coordinates

    imageUuid: string

}