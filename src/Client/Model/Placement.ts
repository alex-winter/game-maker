import { Coordinates } from 'Model/Coordinates'

export interface PlacementImage {

    uuid: string

    src: string

}

export interface CollisionPlacement {

    coordinate: Coordinates

}

export interface ImagePlacement {

    coordinate: Coordinates

    imageUuid: string

}