import { Coordinate } from 'Client/Model/Coordinate'
import { Component } from 'Client/Service/Component'

interface UserDataWindow {

    name: string

    position: Coordinate

    width: number

    height: number

    component: typeof Component

}

export interface UserData {

    windows: UserDataWindow[]

}