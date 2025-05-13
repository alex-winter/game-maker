import { Coordinate } from 'Client/Model/Coordinate'

export interface PlacementImage {

    uuid: string

    src: string

}

export interface Placement {

    coordinate: Coordinate

    imageUuid: string

}