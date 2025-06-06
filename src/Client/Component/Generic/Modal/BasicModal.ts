import { Component, ExternalListeners, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'

export class BasicModal extends Component {

    protected listeners: Listeners = {
        '.backdrop:click': this.handleClickBackdrop,
    }

    protected externalListeners: ExternalListeners = {
        'close-modal': this.handleCloseModal,
    }

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

        content.append(slot)

        backdrop.append(content)

        return backdrop
    }

    private getBackdrop(): HTMLDivElement {
        return this.findOne('.backdrop')!
    }

    private handleCloseModal(event: CustomEvent): void {
        if (this.contains(event.detail as Component)) {
            this.remove()
        }
    }

    private handleClickBackdrop(event: Event): void {
        if (event.target === this.getBackdrop()) {
            this.remove()
        }
    }
}
