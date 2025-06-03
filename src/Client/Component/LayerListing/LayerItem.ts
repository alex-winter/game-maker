import { Component, ExternalListeners, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { Layer } from 'Model/Layer'

export class LayerItem extends Component {
    private layer!: Layer

    protected externalListeners: ExternalListeners = {
        'layer-update': this.handleLayerUpdate,
        'layer-deleted': this.handleLayerDeleted,
    }

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
        this.layer = this.parsedDataset.layer
    }

    protected build(): HTMLElement {
        const container = Dom.div('container')
        const name = Dom.div()
        const options = Dom.div('options')
        const visibleButton = Dom.button('', 'visibility-button')
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

        container.classList.toggle('active', this.layer.is_active)

        container.classList.toggle('collision-layer', this.layer.type === 'collision')

        container.addEventListener('click', this.handleContainerClick)
        visibleButton.addEventListener('click', this.handleVisibleButtonClick)
        deleteButton.addEventListener('click', this.handleClickDelete)

        deleteButton.append(trashIcon)
        visibleButton.append(eyeIcon)

        options.append(
            deleteButton,
            visibleButton,
        )

        container.append(
            name,
            options,
        )

        return container
    }

    private handleLayerUpdate(event: CustomEvent): void {
        const update = event.detail as Layer

        if (update.uuid === this.layer.uuid) {
            this.layer = event.detail as Layer
            this.patch()
        }
    }

    private handleLayerDeleted(event: CustomEvent): void {
        const uuid = event.detail as string

        if (this.layer.uuid === uuid) {
            this.destroy()
        }
    }
}