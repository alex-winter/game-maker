import { Coordinate } from 'Client/Model/Coordinate'

export interface PlacementImage {

    uuid: string

    src: string

}

export interface CollisionPlacement {

    coordinate: Coordinate

}

export interface ImagePlacement {

    coordinate: Coordinate

    imageUuid: string

}