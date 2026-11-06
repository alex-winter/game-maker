import { Coordinates } from 'domain/coordinates'

/** A picture a legacy placement points at. Read-only since T-020. */
export type PlacementImage = {
    uuid: string

    src: string
}

export type Placement = {
    uuid: string
}

export type ImagePlacement = Placement & {
    coordinate: Coordinates

    imageUuid: string
}
