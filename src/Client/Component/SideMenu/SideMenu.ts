import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { Listeners } from 'event-driven-web-components/dist/types/Listeners'

export class SideMenu extends Component {
    public isSingleton: boolean = true

    protected listeners: Listeners = {
        '.open-sheet-importer:click': function () {
            Events.emit('open-sheet-importer')
        },
        '.open-history:click': function () {
            Events.emit('click-open-history')
        }
    }

    protected css(): string {
        return /*css*/`
            :host {
                background-color: whitesmoke;
                position: fixed;
                left: 0;
                right: 0;
                height: 100vh;
                width: 200px;
                z-index: 800;
            }
        `
    }

    protected build(): HTMLElement {
        const container = Dom.div()

        const slot = Dom.slot()
        container.appendChild(slot)

        const importButton = Dom.button('', 'open-sheet-importer')
        const importIcon = Dom.i('fa-solid', 'fa-images')
        importButton.appendChild(importIcon)

        container.appendChild(importButton)

        const historyButton = Dom.button('', 'open-history')
        const historyIcon = Dom.i('fa-solid', 'fa-clock-rotate-left')
        historyButton.appendChild(historyIcon)

        container.appendChild(historyButton)

        return container
    }
}