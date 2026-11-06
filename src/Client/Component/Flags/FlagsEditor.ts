import { Component, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { projectRepository } from 'Client/Service/Repository/ProjectRepository'
import { Flag } from 'domain/flags'

/**
 * The project's story flags: a list of names to add to, rename, and delete.
 * Events refer to a flag by id, so renaming is safe and deleting leaves
 * those events pointing at nothing — the confirm says so.
 */
export class FlagsEditor extends Component {
    private flags: Flag[] = []

    protected listeners: Listeners = {
        '.new-flag:click': this.handleNewFlag,
        '.flag-name:change': this.handleRename,
        '.delete-flag:click': this.handleDelete,
    }

    protected css(): string {
        return /*css*/`
            :host {
                display: block;
                font-family: 'Segoe UI', sans-serif;
                font-size: 13px;
                color: #333;
                min-width: 320px;
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

            .flag {
                display: flex;
                gap: 6px;
                align-items: center;
            }

            .flag-name {
                flex: 1;
                padding: 4px 6px;
                border-radius: 6px;
                border: 1px solid #ccc;
            }

            .id {
                font-family: monospace;
                font-size: 10px;
                color: #999;
                width: 70px;
                overflow: hidden;
                text-overflow: ellipsis;
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
        this.flags = (await projectRepository.load()).flags
    }

    protected build(): HTMLElement {
        const container = Dom.div('flags-editor')
        const toolbar = Dom.div('toolbar')

        toolbar.append(Dom.button('+ Flag', 'new-flag'), Dom.span('A flag is a switch the story sets: items taken, people talked to.', 'hint'))
        container.append(toolbar)

        if (this.flags.length === 0) {
            const empty = Dom.div('empty')

            empty.textContent = 'No flags yet.'
            container.append(empty)

            return container
        }

        const list = Dom.div('list')

        for (const flag of this.flags) {
            const row = Dom.div('flag')
            const name = document.createElement('input')
            const remove = Dom.button('×', 'delete-flag')
            const id = Dom.span(flag.id, 'id')

            name.className = 'flag-name'
            name.value = flag.name
            name.dataset.id = flag.id
            remove.dataset.id = flag.id
            remove.title = 'Delete this flag'
            id.title = flag.id
            row.append(Dom.i('fa-solid', 'fa-flag'), name, id, remove)
            list.append(row)
        }

        container.append(list)

        return container
    }

    private flagIdOf(target: EventTarget | null): string | undefined {
        return target instanceof HTMLElement ? target.dataset.id : undefined
    }

    private async refresh(): Promise<void> {
        this.flags = (await projectRepository.load()).flags
        this.patch()
    }

    private async handleNewFlag(): Promise<void> {
        const name = window.prompt('Flag name', 'Flag ' + (this.flags.length + 1))

        if (name === null || name.trim() === '') {
            return
        }

        await projectRepository.createFlag(name.trim())
        await this.refresh()
    }

    private async handleRename(event: Event): Promise<void> {
        const input = event.target
        const flagId = this.flagIdOf(input)

        if (flagId === undefined || !(input instanceof HTMLInputElement)) {
            return
        }

        const name = input.value.trim()

        if (name === '') {
            await this.refresh()
            return
        }

        await projectRepository.renameFlag(flagId, name)
        await this.refresh()
    }

    private async handleDelete(event: Event): Promise<void> {
        const flagId = this.flagIdOf(event.target)
        const flag = this.flags.find(each => each.id === flagId)

        if (flag === undefined || !window.confirm(`Delete flag "${flag.name}"? Events that set or read it will refer to nothing.`)) {
            return
        }

        await projectRepository.deleteFlag(flag.id)
        await this.refresh()
    }
}
