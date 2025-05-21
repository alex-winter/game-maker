import { Coordinates, Rect } from 'Model/Coordinates'
import { Dataset } from 'Model/Dataset'

type ComponentConfiguration = {
    dataset: Dataset
}

export type WindowConfiguration = {
    uuid: string
    componentConfigration: ComponentConfiguration
    rect?: Rect
}

type WindowConfigurations = {
    [key: string]: WindowConfiguration
}

export type UserData = {

    lastViewPosition: Coordinates

    windows: WindowConfigurations

}