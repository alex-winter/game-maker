import { BasicModal } from 'Client/Component/Generic/Modal/BasicModal'
import { ConfirmDialog } from 'Client/Component/MapSelect/ConfirmDialog'
import { MapSizeForm } from 'Client/Component/MapSelect/MapSizeForm'
import { Component, ExternalListeners, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { urlForMap } from 'Client/Service/active-map'
import { projectRepository } from 'Client/Service/Repository/ProjectRepository'
import { Id } from 'domain/id'
import { GridSize } from 'domain/map'
import { GameMap, isValidMapName } from 'domain/project'

const DELETE_TOPIC = 'map-select:delete'

/**
 * The project's maps: switch, create, rename, resize, delete. Switching and
 * creating reload the page on the chosen map, which keeps every component's
 * state tied to one map. Delete confirms in the modal.
 */
export class MapSelect extends Component<{ activeMapId: Id | null }> {
    private maps: GameMap[] = []
    private activeMapId: Id | null = null

    protected listeners: Listeners = {
        'select:change': this.handleChange,
        '.add-map:click': this.handleAddMap,
        '.rename-map:click': this.handleRenameMap,
        '.resize-map:click': this.handleResizeMap,
        '.delete-map:click': this.handleDeleteMap,
    }

    protected externalListeners: ExternalListeners = {
        'confirmed': this.handleConfirmed,
        'map-size-submit': this.handleSizeSubmit,
    }

    protected css(): string {
        return /*css*/`
            .map-select {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .row {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            select {
                flex: 1;
                padding: 6px;
                border-radius: 6px;
                border: 1px solid #ccc;
            }

            .add-map {
                padding: 6px 10px;
                border: none;
                border-radius: 6px;
                background: #2ecc71;
                color: white;
                cursor: pointer;
            }

            .details {
                font-size: 12px;
                color: #666;
                flex: 1;
            }

            .actions button {
                border: none;
                background: transparent;
                font-size: 14px;
                color: #555;
                cursor: pointer;
                padding: 4px 6px;
            }

            .actions button:hover {
                color: #000;
            }

            .actions .delete-map:hover {
                color: #c0392b;
            }

            .actions i {
                pointer-events: none;
            }
        `
    }

    protected async setup(): Promise<void> {
        this.activeMapId = this.parsedDataset.activeMapId
        this.maps = (await projectRepository.load()).maps
    }

    protected build(): HTMLElement {
        const container = Dom.div('map-select')
        const top = Dom.div('row')
        const select = document.createElement('select')
        const active = this.activeMap()

        for (const map of this.maps) {
            const option = document.createElement('option')

            option.value = map.id
            option.textContent = map.name
            option.selected = map.id === this.activeMapId

            select.append(option)
        }

        if (this.maps.length === 0) {
            const option = document.createElement('option')

            option.textContent = 'No maps'
            select.append(option)
            select.disabled = true
        }

        top.append(select, Dom.button('+ Map', 'add-map'))
        container.append(top)

        if (active !== undefined) {
            const bottom = Dom.div('row')
            const actions = Dom.div('actions')
            const rename = Dom.button('', 'rename-map')
            const resize = Dom.button('', 'resize-map')
            const remove = Dom.button('', 'delete-map')

            rename.title = 'Rename map'
            resize.title = 'Resize map'
            remove.title = 'Delete map'
            rename.append(Dom.i('fa-solid', 'fa-pen'))
            resize.append(Dom.i('fa-solid', 'fa-up-right-and-down-left-from-center'))
            remove.append(Dom.i('fa-solid', 'fa-trash'))
            actions.append(rename, resize, remove)

            bottom.append(
                Dom.span(`${active.tileMap.width} × ${active.tileMap.height} cells`, 'details'),
                actions,
            )
            container.append(bottom)
        }

        return container
    }

    private activeMap(): GameMap | undefined {
        return this.maps.find(map => map.id === this.activeMapId)
    }

    private handleChange(event: Event): void {
        const select = event.target

        if (select instanceof HTMLSelectElement && select.value !== this.activeMapId) {
            window.location.assign(urlForMap(window.location.pathname, select.value))
        }
    }

    private async handleAddMap(): Promise<void> {
        const name = window.prompt('Map name')

        if (!isValidMapName(name)) {
            return
        }

        const map = await projectRepository.createMap(name.trim())

        window.location.assign(urlForMap(window.location.pathname, map.id))
    }

    private async handleRenameMap(): Promise<void> {
        const active = this.activeMap()

        if (active === undefined) {
            return
        }

        const name = window.prompt('Map name', active.name)

        if (!isValidMapName(name) || name.trim() === active.name) {
            return
        }

        const renamed = await projectRepository.renameMap(active.id, name.trim())

        active.name = renamed.name
        this.patch()
    }

    private handleResizeMap(): void {
        const active = this.activeMap()

        if (active === undefined) {
            return
        }

        this.openModal(Dom.makeComponent(MapSizeForm, { width: active.tileMap.width, height: active.tileMap.height }))
    }

    private handleDeleteMap(): void {
        const active = this.activeMap()

        if (active === undefined) {
            return
        }

        this.openModal(Dom.makeComponent(ConfirmDialog, {
            topic: DELETE_TOPIC,
            message: `Delete the map "${active.name}"? Its tiles and attributes are lost.`,
            confirmLabel: 'Delete map',
        }))
    }

    private openModal(content: HTMLElement): void {
        const modal = Dom.makeComponent(BasicModal)

        modal.append(content)
        this.getRootNode().appendChild(modal)
    }

    private async handleConfirmed(topic: string): Promise<void> {
        const active = this.activeMap()

        if (topic !== DELETE_TOPIC || active === undefined) {
            return
        }

        await projectRepository.deleteMap(active.id)

        const remaining = this.maps.filter(map => map.id !== active.id)
        const next = remaining[0]

        // Deleting the active map selects another, or lands on the empty state.
        window.location.assign(next === undefined ? window.location.pathname : urlForMap(window.location.pathname, next.id))
    }

    private async handleSizeSubmit(size: GridSize): Promise<void> {
        const active = this.activeMap()

        if (active === undefined) {
            return
        }

        await projectRepository.resizeMap(active.id, size)

        // The canvas, listing, and session all hold the old grid; a reload is the honest way to replace them.
        window.location.reload()
    }
}
