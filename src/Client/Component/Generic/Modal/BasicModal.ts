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

    private handleCloseModal(component: Component): void {
        if (this.contains(component)) {
            this.remove()
        }
    }

    private handleClickBackdrop(event: Event): void {
        if (event.target === this.getBackdrop()) {
            this.remove()
        }
    }
}
