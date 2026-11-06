import { Component, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { projectRepository } from 'Client/Service/Repository/ProjectRepository'
import { Dialog } from 'domain/dialog'
import { Id } from 'domain/id'
import { MESSAGE_COLUMNS, MESSAGE_LINES, wrapText } from 'engine/message'

/**
 * Authors the project's dialogs: pick one, write its pages, add or remove
 * pages. Every change saves. A page is what the play message box shows at
 * once, so the editor warns when a page needs more than two lines.
 */
export class DialogEditor extends Component<{ dialogId: Id | null }> {
    private dialogs: Dialog[] = []
    private dialog: Dialog | undefined

    protected listeners: Listeners = {
        '.dialog-select:change': this.handleDialogSelect,
        '.new-dialog:click': this.handleNewDialog,
        '.rename-dialog:click': this.handleRenameDialog,
        '.delete-dialog:click': this.handleDeleteDialog,
        '.page-text:change': this.handlePageChange,
        '.page-text:input': this.handlePageInput,
        '.add-page:click': this.handleAddPage,
        '.remove-page:click': this.handleRemovePage,
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
                flex-wrap: wrap;
                gap: 8px;
                align-items: center;
                padding-bottom: 8px;
                border-bottom: 1px solid #ddd;
                margin-bottom: 8px;
            }

            select, input, button, textarea {
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

            .pages {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .page {
                display: flex;
                gap: 6px;
                align-items: flex-start;
            }

            .page-number {
                width: 24px;
                padding-top: 6px;
                color: #666;
                text-align: right;
            }

            .page-body {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 2px;
            }

            .page-text {
                width: 100%;
                box-sizing: border-box;
                min-height: 48px;
                resize: vertical;
                padding: 6px;
                border-radius: 6px;
                border: 1px solid #ccc;
                font-family: monospace;
            }

            .page-text.overflow {
                border-color: #e67e22;
            }

            .fit {
                font-size: 11px;
                color: #666;
                min-height: 1.2em;
            }

            .fit.overflow {
                color: #e67e22;
            }

            .remove-page {
                padding: 4px 8px;
            }

            .hint, .empty {
                color: #666;
            }

            .empty {
                padding: 24px;
            }

            .id {
                font-family: monospace;
                font-size: 11px;
                color: #888;
            }
        `
    }

    protected async setup(): Promise<void> {
        this.dialogs = (await projectRepository.load()).dialogs

        const requested = this.parsedDataset.dialogId

        this.dialog = this.dialogs.find(dialog => dialog.id === requested) ?? this.dialogs[0]
    }

    protected build(): HTMLElement {
        const container = Dom.div('dialog-editor')

        container.append(this.buildToolbar())

        if (this.dialog === undefined) {
            const empty = Dom.div('empty')

            empty.textContent = 'No dialogs yet. Use "+ Dialog" to write one, then attach it to a sign on the map.'
            container.append(empty)

            return container
        }

        const pages = Dom.div('pages')

        this.dialog.pages.forEach((page, index) => {
            pages.append(this.buildPage(page, index, this.dialog?.pages.length ?? 0))
        })

        const footer = Dom.div('toolbar')

        footer.append(
            Dom.button('+ Page', 'add-page'),
            Dom.span(`Each page shows ${MESSAGE_LINES} lines of ${MESSAGE_COLUMNS} characters in play.`, 'hint'),
        )
        container.append(pages, footer)

        return container
    }

    private buildToolbar(): HTMLElement {
        const bar = Dom.div('toolbar')
        const select = document.createElement('select')

        select.className = 'dialog-select'

        for (const dialog of this.dialogs) {
            const option = document.createElement('option')

            option.value = dialog.id
            option.textContent = dialog.name
            option.selected = dialog.id === this.dialog?.id
            select.append(option)
        }

        if (this.dialogs.length === 0) {
            const option = document.createElement('option')

            option.textContent = 'No dialogs'
            select.append(option)
            select.disabled = true
        }

        bar.append(select, Dom.button('+ Dialog', 'new-dialog'))

        if (this.dialog !== undefined) {
            bar.append(Dom.button('Rename', 'rename-dialog'), Dom.button('Delete', 'delete-dialog'), Dom.span(this.dialog.id, 'id'))
        }

        return bar
    }

    private buildPage(text: string, index: number, count: number): HTMLElement {
        const row = Dom.div('page')
        const body = Dom.div('page-body')
        const area = Dom.inputTextArea('page-text')
        const fit = Dom.span('', 'fit')

        area.value = text
        area.dataset.index = String(index)
        area.placeholder = 'What the sign says on this page…'
        this.showFit(area, fit)
        body.append(area, fit)

        const remove = Dom.button('×', 'remove-page')

        remove.title = 'Remove this page'
        remove.dataset.index = String(index)
        remove.disabled = count <= 1

        row.append(Dom.span(String(index + 1) + '.', 'page-number'), body, remove)

        return row
    }

    /** Tells the author how the page wraps in play, and flags one that needs more lines than the box has. */
    private showFit(area: HTMLTextAreaElement, fit: HTMLElement): void {
        const lines = wrapText(area.value.trim(), MESSAGE_COLUMNS)
        const overflow = lines.length > MESSAGE_LINES

        fit.textContent = overflow
            ? `${lines.length} lines: the box shows ${MESSAGE_LINES}. Split this page.`
            : `${lines.length} line${lines.length === 1 ? '' : 's'}`
        fit.classList.toggle('overflow', overflow)
        area.classList.toggle('overflow', overflow)
    }

    private indexOf(target: EventTarget | null): number | undefined {
        const index = target instanceof HTMLElement ? Number(target.dataset.index) : NaN

        return Number.isInteger(index) ? index : undefined
    }

    private async save(dialog: Dialog): Promise<void> {
        const saved = await projectRepository.saveDialog(dialog)

        this.dialogs = (await projectRepository.load()).dialogs
        this.dialog = saved
        this.patch()
    }

    private async handleDialogSelect(event: Event): Promise<void> {
        if (!(event.target instanceof HTMLSelectElement)) {
            return
        }

        const id = event.target.value

        this.dialog = this.dialogs.find(dialog => dialog.id === id)
        this.patch()
    }

    private async handleNewDialog(): Promise<void> {
        const name = window.prompt('Dialog name', 'Dialog ' + (this.dialogs.length + 1))

        if (name === null || name.trim() === '') {
            return
        }

        const created = await projectRepository.createDialog({ name: name.trim(), pages: [''] })

        this.dialogs = (await projectRepository.load()).dialogs
        this.dialog = created
        this.patch()
    }

    private async handleRenameDialog(): Promise<void> {
        if (this.dialog === undefined) {
            return
        }

        const name = window.prompt('Dialog name', this.dialog.name)

        if (name === null || name.trim() === '') {
            return
        }

        await this.save({ ...this.dialog, name: name.trim() })
    }

    private async handleDeleteDialog(): Promise<void> {
        if (this.dialog === undefined || !window.confirm(`Delete dialog "${this.dialog.name}"? Signs that use it will say it is missing.`)) {
            return
        }

        await projectRepository.deleteDialog(this.dialog.id)

        this.dialogs = (await projectRepository.load()).dialogs
        this.dialog = this.dialogs[0]
        this.patch()
    }

    private handlePageInput(event: Event): void {
        const area = event.target

        if (!(area instanceof HTMLTextAreaElement)) {
            return
        }

        const fit = area.parentElement?.querySelector('.fit')

        if (fit instanceof HTMLElement) {
            this.showFit(area, fit)
        }
    }

    private async handlePageChange(event: Event): Promise<void> {
        const area = event.target
        const index = this.indexOf(area)

        if (this.dialog === undefined || index === undefined || !(area instanceof HTMLTextAreaElement)) {
            return
        }

        const pages = this.dialog.pages.map((page, each) => (each === index ? area.value : page))

        await this.save({ ...this.dialog, pages })
    }

    private async handleAddPage(): Promise<void> {
        if (this.dialog === undefined) {
            return
        }

        await this.save({ ...this.dialog, pages: [...this.dialog.pages, ''] })
    }

    private async handleRemovePage(event: Event): Promise<void> {
        const index = this.indexOf(event.target)

        if (this.dialog === undefined || index === undefined || this.dialog.pages.length <= 1) {
            return
        }

        await this.save({ ...this.dialog, pages: this.dialog.pages.filter((_page, each) => each !== index) })
    }
}
