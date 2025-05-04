import { EVENTS } from 'Client/Constants/events'
import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'

export class BasicModal extends Component {

    protected css(): string {
        return /*css*/`
            .backdrop {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
            }

            .modal-content {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
                font-family: sans-serif;
            }
        `
    }

    protected build(): HTMLElement {
        const backdrop = Dom.div('backdrop')
        const content = Dom.div('modal-content')
        const slot = Dom.slot()

        backdrop.addEventListener('click', (event: MouseEvent) => {
            if (event.target === backdrop) {
                this.destroy()
            }
        })

        Events.listen(EVENTS.closeModal, (event) => {
            if (this.contains(event.detail as Component)) {
                this.destroy()
            }
        })

        content.append(slot)

        backdrop.appendChild(content)

        return backdrop
    }
}
