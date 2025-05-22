import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'

export class CanvasTools extends Component {
    private currentTool: string = 'pencil'

    public isSingleton: boolean = true

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
                border: 4px solid whitesmoke;
            }

            button.active {
                border-color: black;
            }
        `
    }

    protected async setup(): Promise<void> {
        this.currentTool = this.parameters.currentTool
    }

    protected build(): HTMLElement {
        const container = Dom.div('container')

        const pencilButton = Dom.button()
        const pencilIcon = Dom.i('fa-solid', 'fa-pencil')
        pencilButton.append(pencilIcon)
        pencilButton.classList.toggle('active', this.currentTool === 'pencil')
        pencilButton.addEventListener('click', this.handlePencilToolClick)

        const fillButton = Dom.button()
        const fillIcon = Dom.i('fa-solid', 'fa-fill-drip')
        fillButton.append(fillIcon)
        fillButton.classList.toggle('active', this.currentTool === 'fill')
        fillButton.addEventListener('click', this.handleFillToolClick)


        container.append(
            pencilButton,
            fillButton,
        )

        return container
    }

    private handlePencilToolClick = (event: Event): void => {
        Events.emit('tool-selection', this.currentTool = 'pencil')
        this.patch()
    }

    private handleFillToolClick = (event: Event): void => {
        Events.emit('tool-selection', this.currentTool = 'fill')
        this.patch()
    }
}