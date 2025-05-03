import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'

export class BasicModal extends Component {

    protected css(): string {
        return /*css*/`
            :host {
                position: fixed;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
            }
        `
    }

    protected build(): HTMLElement {
        const container = Dom.div()

        return container
    }
}