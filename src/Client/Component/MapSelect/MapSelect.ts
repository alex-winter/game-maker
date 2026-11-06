import { Component, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { urlForMap } from 'Client/Service/active-map'
import { projectRepository } from 'Client/Service/Repository/ProjectRepository'
import { Id } from 'domain/id'
import { GameMap } from 'domain/project'

/**
 * The minimum needed to open a second map: a list to switch and a button to
 * create. Switching reloads the page on the chosen map. Rename, resize, and
 * delete arrive with T-025.
 */
export class MapSelect extends Component<{ activeMapId: Id }> {
    private maps: GameMap[] = []
    private activeMapId!: Id

    protected listeners: Listeners = {
        'select:change': this.handleChange,
        '.add-map:click': this.handleAddMap,
    }

    protected css(): string {
        return /*css*/`
            .map-select {
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
        `
    }

    protected async setup(): Promise<void> {
        this.activeMapId = this.parsedDataset.activeMapId
        this.maps = (await projectRepository.load()).maps
    }

    protected build(): HTMLElement {
        const container = Dom.div('map-select')
        const select = document.createElement('select')

        for (const map of this.maps) {
            const option = document.createElement('option')

            option.value = map.id
            option.textContent = map.name
            option.selected = map.id === this.activeMapId

            select.append(option)
        }

        container.append(select, Dom.button('+ Map', 'add-map'))

        return container
    }

    private handleChange(event: Event): void {
        const select = event.target

        if (select instanceof HTMLSelectElement && select.value !== this.activeMapId) {
            window.location.assign(urlForMap(window.location.pathname, select.value))
        }
    }

    private async handleAddMap(): Promise<void> {
        const name = window.prompt('Map name')

        if (name === null || name.trim() === '') {
            return
        }

        const map = await projectRepository.createMap(name.trim())

        window.location.assign(urlForMap(window.location.pathname, map.id))
    }
}
