import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'

export class AnimationMaker extends Component {
    protected build(): HTMLElement {
        const container = Dom.div('container')

        return container
    }
}