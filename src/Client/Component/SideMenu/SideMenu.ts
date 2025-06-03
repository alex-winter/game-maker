import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'

export class SideMenu extends Component {
    public isSingleton: boolean = true

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
        const sheetImportOption = this.buildSheetImportOption()

        container.append(
            slot,
            sheetImportOption,
            this.buildHistoryOption()
        )

        return container
    }

    protected buildSheetImportOption(): HTMLElement {
        const option = Dom.button()
        const icon = Dom.i('fa-solid', 'fa-images')

        option.addEventListener('click', () => Events.emit('open-sheet-importer'))

        option.append(icon)

        return option
    }

    protected buildHistoryOption(): HTMLElement {
        const option = Dom.button()
        const icon = Dom.i('fa-solid', 'fa-clock-rotate-left')

        option.addEventListener('click', () => Events.emit('click-open-history'))

        option.append(icon)

        return option
    }
}