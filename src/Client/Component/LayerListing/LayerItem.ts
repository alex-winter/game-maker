import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { Layer } from 'Model/Layer'

export class LayerItem extends Component {
    private layer!: Layer
    private container!: HTMLDivElement
    private visibleButton!: HTMLButtonElement

    private handleContainerClick = () => {
        console.log('clicked container')
        Events.emit('layer-active', this.layer)
    }

    private handleVisibleButtonClick = (e: Event) => {
        e.stopPropagation()
        Events.emit('layer-visible-toggle', this.layer)
    }

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
        console.log('built')

        this.container = Dom.div('container')
        const name = Dom.div()
        const options = Dom.div('options')
        this.visibleButton = Dom.button()
        const eyeIcon = document.createElement('i')

        name.innerText = this.layer.name

        eyeIcon.classList.add('fa-solid', this.layer.is_visible ? 'fa-eye' : 'fa-eye-slash')

        this.container.classList.toggle('active', this.layer.is_active)


        this.container.addEventListener('click', this.handleContainerClick)
        this.visibleButton.addEventListener('click', this.handleVisibleButtonClick)


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
        console.log('yeah running')

        Events.listen(event => {
            console.log('saw update')
            const update = event.detail as Layer
            if (update.uuid === this.layer.uuid) {
                console.log('update the one')
                this.layer = event.detail as Layer
                this.patch()
            }
        }, 'layer-update')
    }
}