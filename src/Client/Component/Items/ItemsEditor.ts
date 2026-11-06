import { Component, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { projectRepository } from 'Client/Service/Repository/ProjectRepository'
import { Item } from 'domain/item'

/**
 * The project's item catalog: name and description per item, added to,
 * edited inline, and deleted. Item events refer to an item by id.
 */
export class ItemsEditor extends Component {
    private items: Item[] = []

    protected listeners: Listeners = {
        '.new-item:click': this.handleNewItem,
        '.item-name:change': this.handleChange,
        '.item-description:change': this.handleChange,
        '.delete-item:click': this.handleDelete,
    }

    protected css(): string {
        return /*css*/`
            :host {
                display: block;
                font-family: 'Segoe UI', sans-serif;
                font-size: 13px;
                color: #333;
                min-width: 420px;
            }

            .toolbar {
                display: flex;
                gap: 8px;
                align-items: center;
                padding-bottom: 8px;
                border-bottom: 1px solid #ddd;
                margin-bottom: 8px;
            }

            input, button {
                font: inherit;
            }

            button {
                padding: 4px 10px;
                border-radius: 6px;
                border: 1px solid #ccc;
                background: #fff;
                cursor: pointer;
            }

            button:hover {
                background: #f0f0f0;
            }

            .list {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .item {
                display: flex;
                gap: 6px;
                align-items: center;
            }

            .item input {
                padding: 4px 6px;
                border-radius: 6px;
                border: 1px solid #ccc;
            }

            .item-name {
                width: 130px;
            }

            .item-description {
                flex: 1;
            }

            .hint, .empty {
                color: #666;
            }

            .empty {
                padding: 16px 0;
            }
        `
    }

    protected async setup(): Promise<void> {
        this.items = (await projectRepository.load()).items
    }

    protected build(): HTMLElement {
        const container = Dom.div('items-editor')
        const toolbar = Dom.div('toolbar')

        toolbar.append(Dom.button('+ Item', 'new-item'), Dom.span('Place one on a map from the Events row.', 'hint'))
        container.append(toolbar)

        if (this.items.length === 0) {
            const empty = Dom.div('empty')

            empty.textContent = 'No items yet.'
            container.append(empty)

            return container
        }

        const list = Dom.div('list')

        for (const item of this.items) {
            const row = Dom.div('item')
            const name = document.createElement('input')
            const description = document.createElement('input')
            const remove = Dom.button('×', 'delete-item')

            name.className = 'item-name'
            name.value = item.name
            name.placeholder = 'Name'
            name.dataset.id = item.id
            description.className = 'item-description'
            description.value = item.description
            description.placeholder = 'Description'
            description.dataset.id = item.id
            remove.dataset.id = item.id
            remove.title = 'Delete this item'
            row.append(Dom.i('fa-solid', 'fa-box'), name, description, remove)
            list.append(row)
        }

        container.append(list)

        return container
    }

    private itemIdOf(target: EventTarget | null): string | undefined {
        return target instanceof HTMLElement ? target.dataset.id : undefined
    }

    private async refresh(): Promise<void> {
        this.items = (await projectRepository.load()).items
        this.patch()
    }

    private async handleNewItem(): Promise<void> {
        const name = window.prompt('Item name', 'Item ' + (this.items.length + 1))

        if (name === null || name.trim() === '') {
            return
        }

        await projectRepository.createItem({ name: name.trim(), description: '' })
        await this.refresh()
    }

    /** Reads the whole row, so name and description save together. */
    private async handleChange(event: Event): Promise<void> {
        const control = event.target
        const itemId = this.itemIdOf(control)
        const row = control instanceof HTMLElement ? control.closest('.item') : null
        const name = row?.querySelector('.item-name')
        const description = row?.querySelector('.item-description')

        if (itemId === undefined || !(name instanceof HTMLInputElement) || !(description instanceof HTMLInputElement)) {
            return
        }

        if (name.value.trim() === '') {
            await this.refresh()
            return
        }

        await projectRepository.saveItem({ id: itemId, name: name.value.trim(), description: description.value.trim() })
        await this.refresh()
    }

    private async handleDelete(event: Event): Promise<void> {
        const itemId = this.itemIdOf(event.target)
        const item = this.items.find(each => each.id === itemId)

        if (item === undefined || !window.confirm(`Delete item "${item.name}"? Item events that place it will find nothing.`)) {
            return
        }

        await projectRepository.deleteItem(item.id)
        await this.refresh()
    }
}
