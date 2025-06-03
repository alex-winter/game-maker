import { Component, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'

export class AnimationMaker extends Component {
    protected listeners: Listeners = {
    }

    protected css(): string {
        return /*css*/`
            .container {
                background: white;
                padding: 20px;
            }
        `
    }

    protected build(): HTMLElement {
        const container = Dom.div('container')



        return container
    }


} 