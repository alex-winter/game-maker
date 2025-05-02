import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'

export class SideMenu extends Component {
    protected css(): string {
        return /*css*/`
            :host {
                background-color: whitesmoke;
                position: fixed;
                left: 0;
                right: 0;
                height: 100vh;
                width: 200px;
            }
        `
    }

    protected build(): HTMLElement {
        const container = Dom.div()
        const slot = Dom.slot()
        const sheetImportOption = this.buildMiniOption()

        container.append(slot, sheetImportOption)

        return container
    }

    protected buildMiniOption(): HTMLElement {
        const option = Dom.button('s', 'sheet-import')

        option.addEventListener('click', () => Events.emitSheetImportOpen())

        return option
    }
}