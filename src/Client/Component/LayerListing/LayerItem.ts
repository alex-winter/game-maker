import { Component, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { mapSession } from 'Client/Service/map-session'
import { moveTileLayer, removeTileLayer, renameTileLayer, TileLayer } from 'domain/map'

/** One row of the layer listing. Each action computes the next grid with a domain function and commits it. */
export class LayerItem extends Component<{ layer: TileLayer; isActive: boolean; isHidden: boolean }> {
    private layer!: TileLayer

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
        const { isActive, isHidden } = this.parsedDataset
        const container = Dom.div('container')
        const name = Dom.div('name')
        const nameText = Dom.span(this.layer.name, 'name-text')
        const editIcon = Dom.i('fa-solid', 'fa-pen', 'edit-icon')
        const kindIcon = Dom.i('fa-solid', this.layer.kind === 'overhead' ? 'fa-cloud' : 'fa-layer-group', 'kind-icon')

        kindIcon.title = this.layer.kind
        name.append(kindIcon, nameText, editIcon)

        const options = Dom.div('options')
        const visibleButton = Dom.button('', 'visibility-button')
        const deleteButton = Dom.button('', 'delete-button')
        const upButton = Dom.button('', 'up-button')
        const downButton = Dom.button('', 'down-button')

        visibleButton.title = isHidden ? 'Show' : 'Hide'
        upButton.title = 'Bring forward'
        downButton.title = 'Send back'
        deleteButton.title = 'Delete layer'

        visibleButton.append(Dom.i('fa-solid', isHidden ? 'fa-eye-slash' : 'fa-eye'))
        deleteButton.append(Dom.i('fa-solid', 'fa-trash'))
        upButton.append(Dom.i('fa-solid', 'fa-arrow-up'))
        downButton.append(Dom.i('fa-solid', 'fa-arrow-down'))

        options.append(visibleButton, upButton, downButton, deleteButton)

        container.classList.toggle('active', isActive)
        container.classList.toggle('hidden-layer', isHidden)
        container.classList.toggle('overhead', this.layer.kind === 'overhead')
        container.append(name, options)

        return container
    }

    private handleNameClick(event: Event): void {
        event.stopPropagation()

        const nameElement = this.findOne('.name')

        if (nameElement === null) {
            return
        }

        const currentName = this.layer.name
        const input = document.createElement('input')

        input.type = 'text'
        input.value = currentName
        input.className = 'inline-edit-input'

        nameElement.innerHTML = ''
        nameElement.appendChild(input)
        input.focus()
        input.select()

        const finalize = () => {
            const newName = input.value.trim()

            if (newName && newName !== currentName) {
                void mapSession.commit(renameTileLayer(mapSession.tileMap, this.layer.id, newName))
            } else {
                this.patch()
            }
        }

        input.addEventListener('blur', finalize)
        input.addEventListener('keydown', (keyEvent) => {
            if (keyEvent.key === 'Enter') input.blur()
            if (keyEvent.key === 'Escape') this.patch()
        })
    }

    private handleContainerClick(): void {
        mapSession.setActiveLayer(this.layer.id)
    }

    private handleVisibleButtonClick(event: Event): void {
        event.stopPropagation()
        mapSession.toggleHidden(this.layer.id)
    }

    private handleClickDelete(event: Event): void {
        event.stopPropagation()

        if (mapSession.tileMap.layers.length <= 1) {
            return
        }

        if (window.confirm(`Delete layer "${this.layer.name}"? Its tiles are lost.`)) {
            void mapSession.commit(removeTileLayer(mapSession.tileMap, this.layer.id))
        }
    }

    /** Up in the list is toward the front of the draw order. */
    private handleClickUp(event: Event): void {
        event.stopPropagation()
        void mapSession.commit(moveTileLayer(mapSession.tileMap, this.layer.id, 1))
    }

    private handleClickDown(event: Event): void {
        event.stopPropagation()
        void mapSession.commit(moveTileLayer(mapSession.tileMap, this.layer.id, -1))
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

            .container.hidden-layer .name {
                opacity: 0.5;
            }

            .container.overhead {
                border-left: 4px solid #9b59b6;
            }

            .name {
                display: flex;
                align-items: center;
                font-weight: 500;
                font-size: 16px;
                gap: 8px;
                position: relative;
            }

            .kind-icon {
                color: #888;
                font-size: 12px;
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
