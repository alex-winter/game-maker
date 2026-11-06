import { Rect } from 'domain/coordinates'

export type LoadedPlacement = Rect & {
    uuid: string
    layerUuid: string
    image: HTMLImageElement
} 