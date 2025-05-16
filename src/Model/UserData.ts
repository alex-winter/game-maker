import { Coordinate as Coordinates } from 'Client/Model/Coordinate'
import { Component } from 'Client/Service/Component'

interface UserDataWindow {

    name: string

    position: Coordinates

    width: number

    height: number

    component: typeof Component

}

export interface UserData {

    lastViewPosition: Coordinates

}