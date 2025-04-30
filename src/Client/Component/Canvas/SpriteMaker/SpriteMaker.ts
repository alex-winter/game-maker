import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'

export class SpriteMaker extends Component {
    protected build(): HTMLElement {
        const element = Dom.div()
        const canvas = Dom.canvas()

        element.append(canvas)

        return element
    }
}