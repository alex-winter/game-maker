import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { Listeners } from 'event-driven-web-components/dist/types/Listeners'

export class SideMenu extends Component {
    public isSingleton: boolean = true

    protected listeners: Listeners = {
        '.open-sheet-importer:click': () => {
            Events.emit('open-sheet-importer', undefined)
        },
        '.open-history:click': () => {
            Events.emit('click-open-history', undefined)
        },
    }

    protected css(): string {
        return /*css*/`
            :host {
                background-color: #f4f4f4;
                position: fixed;
                left: 0;
                top: 0;
                bottom: 0;
                width: 300px;
                padding: 20px;
                box-shadow: 4px 0 12px rgba(0, 0, 0, 0.1);
                z-index: 800;
            }

            .floating-buttons {
                position: absolute;
                top: 20px;
                left: 100%;
                margin-left: 10px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                z-index: 1000;
            }

            .floating-buttons button {
                width: 42px;
                height: 42px;
                border-radius: 50%;
                background-color: white;
                border: none;
                box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s ease, transform 0.1s ease;
            }

            .floating-buttons button:hover {
                background-color: #eaeaea;
            }

            .floating-buttons button:active {
                transform: scale(0.95);
            }

            .floating-buttons i {
                font-size: 18px;
                color: #555;
            }

            ::slotted(*) {
                margin-bottom: 16px;
            }
        `
    }

    protected build(): HTMLElement {
        const container = Dom.div()

        const slot = Dom.slot()
        container.appendChild(slot)

        const floatingWrapper = Dom.div('floating-buttons')

        const importButton = Dom.button('', 'open-sheet-importer')
        importButton.appendChild(Dom.i('fa-solid', 'fa-images'))

        const historyButton = Dom.button('', 'open-history')
        historyButton.appendChild(Dom.i('fa-solid', 'fa-clock-rotate-left'))

        const newModelButton = Dom.button('', 'open-new-model')
        newModelButton.appendChild(Dom.i('fa-solid', 'fa-camera'))

        floatingWrapper.append(importButton, historyButton, newModelButton)

        container.appendChild(floatingWrapper)

        return container
    }
}
