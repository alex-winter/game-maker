import { Canvas2D } from 'Client/Component/Canvas/Canvas'
import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'

export class SpriteModelMaker extends Component {
    protected build(): HTMLElement {
        const container = Dom.div()

        const canvas = Dom.makeComponent(Canvas2D, { fps: 60 })
        container.append(canvas)



        return container
    }
}