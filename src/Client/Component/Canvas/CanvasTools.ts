import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'

export class CanvasTools extends Component {
    private selectedTool: string = 'pencil'

    protected css(): string {
        return /*css*/`
            :host {
                position: fixed;
                display: block;
                padding: 10px;
                border-radius: 4px;
                background-color: whitesmoke;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 800;
            }

            .container {
                display: flex;
                gap: 10px;
            }

            button {
                padding: 10px;
                flex: 1;
            }
        `
    }

    protected async setup(): Promise<void> {
        this.selectedTool = this.parameters.selectedTool
    }

    protected build(): HTMLElement {
        const container = Dom.div('container')

        const pencilButton = Dom.button()
        const pencilIcon = Dom.i('fa-solid', 'fa-pencil')
        pencilButton.append(pencilIcon)
        pencilButton.classList.toggle('active', this.selectedTool === 'pencil')

        const fillButton = Dom.button()
        const fillIcon = Dom.i('fa-solid', 'fa-fill-drip')
        fillButton.append(fillIcon)
        fillButton.classList.toggle('active', this.selectedTool === 'fill')

        container.append(
            pencilButton,
            fillButton,
        )

        return container
    }
}