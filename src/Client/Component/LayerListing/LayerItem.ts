import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { Layer } from 'Model/Layer'

export class LayerItem extends Component {
    private layer!: Layer
    private container!: HTMLDivElement
    private visibleButton!: HTMLButtonElement

    private handleContainerClick = () => {
        Events.emit('layer-active', this.layer)
    }

    private handleVisibleButtonClick = (e: Event) => {
        e.stopPropagation()
        Events.emit('layer-visible-toggle', this.layer)
    }

    private handleClickDelete = (e: Event) => {
        e.stopPropagation()
        Events.emit('layer-delete', this.layer.uuid)
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

            .container.collision-layer {
                background: #eb4d4b;
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
        const eyeIcon = Dom.i('fa-solid')
        const deleteButton = Dom.button()
        const trashIcon = Dom.i('fa-solid', 'fa-trash')
        const collisionIcon = Dom.i('fa-solid', 'fa-road-barrier')

        if (this.layer.type === 'collision') {
            name.append(collisionIcon)
        }

        name.append(
            document.createTextNode(this.layer.name)
        )

        eyeIcon.classList.add(this.layer.is_visible ? 'fa-eye' : 'fa-eye-slash')

        this.container.classList.toggle('active', this.layer.is_active)

        this.container.classList.toggle('collision-layer', this.layer.type === 'collision')

        this.container.addEventListener('click', this.handleContainerClick)
        this.visibleButton.addEventListener('click', this.handleVisibleButtonClick)
        deleteButton.addEventListener('click', this.handleClickDelete)

        deleteButton.append(trashIcon)
        this.visibleButton.append(eyeIcon)

        options.append(
            deleteButton,
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

        Events.listen(event => {
            const uuid = event.detail as string
            if (this.layer.uuid === uuid) {
                this.destroy()
            }
        }, 'layer-deleted')
    }
}