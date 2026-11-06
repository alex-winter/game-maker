import { Coordinates, Rect } from 'domain/coordinates'
import { Dataset } from 'Model/Dataset'

type ComponentConfiguration = {
    dataset: Dataset
}

export type WindowConfiguration = {
    uuid: string
    componentConfigration: ComponentConfiguration
    rect?: {
        width: string
        height: string
        left: string
        top: string
    }
    title: string
}

type WindowConfigurations = {
    [key: string]: WindowConfiguration
}

export type UserData = {

    lastViewPosition: Coordinates

    windows: WindowConfigurations

    currentTool: string

    /** Integer 1..4; missing in files written before T-021. */
    zoom?: number

    showGrid?: boolean
}