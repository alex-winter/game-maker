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
                padding: 4px;
            }

            .container > div {
                flex: 1;
            }

            .options {
                display: flex;
                justify-content: end;
            }

            .active {
                background: beige;
            }
        `
    }

    protected async setup(): Promise<void> {
        this.layer = this.parameters.layer
    }

    protected build(): HTMLElement {
        this.container = Dom.div('container')
        const name = Dom.div()
        const options = Dom.div('options')
        this.visibleButton = Dom.button()
        const eyeIcon = document.createElement('i')

        name.innerText = this.layer.name

        eyeIcon.classList.add('fa-solid', this.layer.is_visible ? 'fa-eye' : 'fa-eye-slash')

        console.log(this.layer.is_active)

        this.container.classList.toggle('active', this.layer.is_active)

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
        Events.listen(event => {
            const update = event.detail as Layer
            if (update.uuid === this.layer.uuid) {
                this.layer = event.detail as Layer
                this.patch()
            }
        }, 'layer-update')

        this.container.addEventListener('click', () => {
            Events.emit('layer-active', this.layer)
        })

        this.visibleButton.addEventListener('click', (e: Event) => {
            e.stopPropagation()
            Events.emit('layer-visible-toggle', this.layer)
        })
    }
}