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

    protected listeners: Listeners = {
        '.container:click': this.handleContainerClick,
        '.visibility-button:click': this.handleVisibleButtonClick,
        '.delete-button:click': this.handleClickDelete,
        '.up-button:click': this.handleClickUp,
        '.down-button:click': this.handleClickDown,
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
                gap: 4px;
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

        const deleteButton = Dom.button('', 'delete-button')
        const trashIcon = Dom.i('fa-solid', 'fa-trash')

        const upButton = Dom.button('', 'up-button')
        const upIcon = Dom.i('fa-solid', 'fa-arrow-up')

        const downButton = Dom.button('', 'down-button')
        const downIcon = Dom.i('fa-solid', 'fa-arrow-down')

        const collisionIcon = Dom.i('fa-solid', 'fa-road-barrier')

        if (this.layer.type === 'collision') {
            name.append(collisionIcon)
        }

        name.append(document.createTextNode(this.layer.name))

        eyeIcon.classList.add(this.layer.is_visible ? 'fa-eye' : 'fa-eye-slash')
        container.classList.toggle('active', this.layer.is_active)
        container.classList.toggle('collision-layer', this.layer.type === 'collision')

        deleteButton.append(trashIcon)
        visibleButton.append(eyeIcon)
        upButton.append(upIcon)
        downButton.append(downIcon)

        options.append(
            deleteButton,
            visibleButton,
            upButton,
            downButton,
        )

        container.append(name, options)

        return container
    }

    private handleLayerUpdate(event: CustomEvent): void {
        const update = event.detail as Layer

        if (update.uuid === this.layer.uuid) {
            this.layer = update
            this.patch()
        }
    }

    private handleLayerDeleted(event: CustomEvent): void {
        const uuid = event.detail as string

        if (this.layer.uuid === uuid) {
            this.remove()
        }
    }

    private handleContainerClick(): void {
        Events.emit('layer-active', this.layer)
    }

    private handleVisibleButtonClick(e: Event): void {
        e.stopPropagation()
        Events.emit('layer-visible-toggle', this.layer)
    }

    private handleClickDelete(e: Event): void {
        e.stopPropagation()
        Events.emit('layer-delete', this.layer.uuid)
    }

    private handleClickUp(e: Event): void {
        e.stopPropagation()
        console.log('up')
        Events.emit('layer-order-up', this.layer.uuid)
    }

    private handleClickDown(e: Event): void {
        e.stopPropagation()
        Events.emit('layer-order-down', this.layer.uuid)
    }
}
