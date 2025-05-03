import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'

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
                z-index: 1000;
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

        backdrop.addEventListener('click', (event: MouseEvent) => {
            if (event.target === backdrop) {
                this.destroy()
            }
        })

        backdrop.appendChild(content)
        return backdrop
    }
}
