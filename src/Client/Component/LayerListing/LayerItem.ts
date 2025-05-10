import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { Layer } from 'Model/Layer'

export class LayerItem extends Component {
    private layer!: Layer
    private container!: HTMLDivElement
    private visibleButton!: HTMLButtonElement

    protected css(): string {
        return /*css*/`
            .container {
                display: flex;
            }

            .container > div {
                flex: 1;
            }
        `
    }

    protected async setup(): Promise<void> {
        this.layer = this.parameters.layer
    }

    protected build(): HTMLElement {
        this.container = Dom.div('container')
        const name = Dom.div()
        const options = Dom.div()
        this.visibleButton = Dom.button()
        const eyeIcon = document.createElement('i')

        name.innerText = this.layer.name

        eyeIcon.classList.add('fa-solid', this.layer.is_visible ? 'fa-eye' : 'fa-eye-slash')

        this.visibleButton.append(eyeIcon)

        options.append(
            this.visibleButton,
        )

        this.container.append(
            name,
            options,
        )

        return this.container
    }

    protected afterBuild(): void {

        this.container.addEventListener('click', () => {
            Events.emit('layer-active', this.layer)
        })

        this.visibleButton.addEventListener('click', (e: Event) => {
            e.stopPropagation()

            this.layer.is_visible = !this.layer.is_visible

            Events.emit('layer-update', this.layer)

            this.patch()
        })
    }
}