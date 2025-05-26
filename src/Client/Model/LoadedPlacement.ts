import { Rect } from 'Model/Coordinates'

export type LoadedPlacement = Rect & {
    uuid: string
    image: HTMLImageElement
} 