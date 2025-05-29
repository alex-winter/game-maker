import { Rect } from 'Model/Coordinates'

export type LoadedPlacement = Rect & {
    uuid: string
    layerUuid: string
    image: HTMLImageElement
} 