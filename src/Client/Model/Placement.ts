import { Coordinate } from 'Client/Model/Coordinate'

export interface PlacementImage {

    src: string

}

export interface Placement {

    coordinate: Coordinate

    image: PlacementImage

}