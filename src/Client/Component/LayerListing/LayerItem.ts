import { Component, ExternalListeners, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { layerRepository } from 'Client/Service/Repository/LayerRepository'
import { Layer } from 'Model/Layer'

export class LayerItem extends Component {
    private layer!: Layer

    protected externalListeners: ExternalListeners = {
        'layers-update': this.handleLayersUpdate,
        'layer-deleted': this.handleLayerDeleted,
    }

    protected listeners: Listeners = {
        '.container:click': this.handleContainerClick,
        '.visibility-button:click': this.handleVisibleButtonClick,
        '.delete-button:click': this.handleClickDelete,
        '.up-button:click': this.handleClickUp,
        '.down-button:click': this.handleClickDown,
    }

    protected async setup(): Promise<void> {
        this.layer = this.parsedDataset.layer
    }

    protected build(): HTMLElement {
        const container = Dom.div('container')
        const name = Dom.div('name')
        const options = Dom.div('options')

        const visibleButton = Dom.button('', 'visibility-button')
        const eyeIcon = Dom.i('fa-solid', this.layer.is_visible ? 'fa-eye' : 'fa-eye-slash')

        const deleteButton = Dom.button('', 'delete-button')
        const trashIcon = Dom.i('fa-solid', 'fa-trash')

        const upButton = Dom.button('', 'up-button')
        const upIcon = Dom.i('fa-solid', 'fa-arrow-up')

        const downButton = Dom.button('', 'down-button')
        const downIcon = Dom.i('fa-solid', 'fa-arrow-down')

        if (this.layer.type === 'collision') {
            const collisionIcon = Dom.i('fa-solid', 'fa-road-barrier')
            name.append(collisionIcon)
        }

        name.append(document.createTextNode(this.layer.name))

        deleteButton.append(trashIcon)
        visibleButton.append(eyeIcon)
        upButton.append(upIcon)
        downButton.append(downIcon)

        options.append(visibleButton, upButton, downButton, deleteButton)

        container.classList.toggle('active', this.layer.is_active)
        container.classList.toggle('collision-layer', this.layer.type === 'collision')

        container.append(name, options)

        return container
    }

    private handleLayersUpdate(): void {
        this.layer = layerRepository.getByUuid(this.layer.uuid)
        this.patch()
    }

    private handleLayerDeleted(uuid: string): void {
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
        Events.emit('layer-order-up', this.layer.uuid)
    }

    private handleClickDown(e: Event): void {
        e.stopPropagation()
        Events.emit('layer-order-down', this.layer.uuid)
    }

    protected css(): string {
        return /*css*/`
            .container {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 16px;
                border-radius: 10px;
                background: white;
                box-shadow: 0 1px 4px rgba(0,0,0,0.05);
                transition: background 0.3s ease;
                cursor: pointer;
            }

            .container:hover {
                background: #f0f0f0;
            }

            .container.active {
                border: 2px solid #3498db;
                background: #ecf6fd;
            }

            .container.collision-layer {
                background: #ffe8e8;
                border-left: 4px solid #e74c3c;
            }

            .name {
                display: flex;
                align-items: center;
                font-weight: 500;
                font-size: 16px;
                gap: 8px;
            }

            .options {
                display: flex;
                gap: 10px;
            }

            .options button {
                border: none;
                background: transparent;
                font-size: 16px;
                color: #555;
                cursor: pointer;
                padding: 4px;
                transition: color 0.2s;
            }

            .options button:hover {
                color: #000;
            }

            .options i {
                pointer-events: none;
            }
        `
    }
}
