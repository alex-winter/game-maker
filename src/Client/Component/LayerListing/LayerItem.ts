import { Component, ExternalListeners, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { layerRepository } from 'Client/Service/Repository/LayerRepository'
import { Layer } from 'Model/Layer'
import { LAYERS } from 'Client/Constants/layers'

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
        '.name:click': this.handleNameClick,
    }

    protected async setup(): Promise<void> {
        this.layer = this.parsedDataset.layer
    }

    protected build(): HTMLElement {
        this.style.order = this.layer.order.toString()

        const container = Dom.div('container')
        const name = Dom.div('name')
        const nameText = Dom.span(this.layer.name, 'name-text')
        const editIcon = Dom.i('fa-solid', 'fa-pen', 'edit-icon')

        name.append(nameText, editIcon)

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
            name.prepend(collisionIcon)
        }

        if (this.layer.type === LAYERS.typePlayerControlled) {
            const playerIcon = Dom.i('fa-solid', 'fa-user')
            name.prepend(playerIcon)
        }

        deleteButton.append(trashIcon)
        visibleButton.append(eyeIcon)
        upButton.append(upIcon)
        downButton.append(downIcon)

        options.append(visibleButton, upButton, downButton, deleteButton)

        container.classList.toggle('active', this.layer.is_active)
        container.classList.toggle('collision-layer', this.layer.type === 'collision')
        container.classList.toggle('player-layer', this.layer.type === LAYERS.typePlayerControlled)

        container.append(name, options)

        return container
    }

    private handleNameClick(e: Event): void {
        e.stopPropagation()
        const nameEl = this.findOne('.name')!
        const currentName = this.layer.name

        const input = document.createElement('input')
        input.type = 'text'
        input.value = currentName
        input.className = 'inline-edit-input'

        nameEl.innerHTML = ''
        nameEl.appendChild(input)
        input.focus()
        input.select()

        const finalize = () => {
            const newName = input.value.trim()
            if (newName && newName !== currentName) {
                this.layer.name = newName
                layerRepository.update(this.layer)
            }
        }

        input.addEventListener('blur', finalize)
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') input.blur()
            if (e.key === 'Escape') this.patch()
        })
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
            :host {
                display: block;
                flex: 1;
            }
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
                border: 2px solid rgb(255, 255, 255);
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

            .container.player-layer {
                background: #fff7e6;
                border-left: 4px solid #f39c12;
            }

            .container.player-layer .name {
                color: #b35f00;
            }

            .name {
                display: flex;
                align-items: center;
                font-weight: 500;
                font-size: 16px;
                gap: 8px;
                position: relative;
            }

            .name-text {
                flex: 1;
            }

            .edit-icon {
                font-size: 12px;
                opacity: 0;
                transition: opacity 0.2s;
                margin-left: 6px;
                pointer-events: none;
                color: #888;
            }

            .name:hover .edit-icon {
                opacity: 1;
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

            .inline-edit-input {
                font-size: 16px;
                font-weight: 500;
                padding: 4px 6px;
                border: 1px solid #ccc;
                border-radius: 4px;
                width: 100%;
                box-sizing: border-box;
            }
        `
    }
}
