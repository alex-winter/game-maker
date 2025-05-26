import { Coordinates } from 'Model/Coordinates'

export type PlacementImage = {

    uuid: string

    src: string

}

export type CollisionPlacement = {

    coordinate: Coordinates

}

export type ImagePlacement = {

    coordinate: Coordinates

    imageUuid: string

}