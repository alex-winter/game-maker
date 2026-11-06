import { Component, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'

export class SideMenu extends Component {
    public isSingleton: boolean = true

    protected listeners: Listeners = {
        '.open-sheet-importer:click': () => {
            Events.emit('open-sheet-importer', undefined)
        },
        '.open-palette:click': () => {
            Events.emit('open-tileset-palette', undefined)
        },
        '.open-sprite-editor:click': () => {
            Events.emit('open-sprite-editor', undefined)
        },
        '.open-dialog-editor:click': () => {
            Events.emit('open-dialog-editor', undefined)
        },
        '.open-flags-editor:click': () => {
            Events.emit('open-flags-editor', undefined)
        },
    }

    protected css(): string {
        return /*css*/`
            :host {
                background-color: #f4f4f4;
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

        const paletteButton = Dom.button('', 'open-palette')
        paletteButton.title = 'Tileset palette'
        paletteButton.appendChild(Dom.i('fa-solid', 'fa-table-cells'))


        const spriteButton = Dom.button('', 'open-sprite-editor')
        spriteButton.title = 'Sprites'
        spriteButton.appendChild(Dom.i('fa-solid', 'fa-person-walking'))

        const dialogButton = Dom.button('', 'open-dialog-editor')
        dialogButton.title = 'Dialogs'
        dialogButton.appendChild(Dom.i('fa-solid', 'fa-comment-dots'))

        const flagsButton = Dom.button('', 'open-flags-editor')
        flagsButton.title = 'Story flags'
        flagsButton.appendChild(Dom.i('fa-solid', 'fa-flag'))

        floatingWrapper.append(importButton, paletteButton, spriteButton, dialogButton, flagsButton)

        container.appendChild(floatingWrapper)

        return container
    }
}
