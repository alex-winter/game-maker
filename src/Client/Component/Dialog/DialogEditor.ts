import { Component, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { projectRepository } from 'Client/Service/Repository/ProjectRepository'
import { Choice, Dialog, DialogPage, MAX_CHOICES, newPage } from 'domain/dialog'
import { Id } from 'domain/id'
import { Flag } from 'domain/flags'
import { MESSAGE_COLUMNS, MESSAGE_LINES, wrapText } from 'engine/message'

/**
 * Authors the project's dialogs: pick one, write its pages, add or remove
 * pages, and give a page up to four choices that branch to another dialog
 * or end the conversation. Every change saves. A page is what the play
 * message box shows at once, so the editor warns when a page needs more
 * than two lines.
 */
export class DialogEditor extends Component<{ dialogId: Id | null }> {
    private dialogs: Dialog[] = []

    private flags: Flag[] = []
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
        '.add-choice:click': this.handleAddChoice,
        '.remove-choice:click': this.handleRemoveChoice,
        '.choice-label:change': this.handleChoiceChange,
        '.choice-target:change': this.handleChoiceChange,
        '.page-flag:change': this.handlePageFlagChange,
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

            .page-flag-row {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-top: 4px;
                color: #666;
            }

            .choices {
                display: flex;
                flex-direction: column;
                gap: 4px;
                margin-top: 4px;
                padding-left: 8px;
                border-left: 2px solid #d4a017;
            }

            .choice {
                display: flex;
                gap: 6px;
                align-items: center;
            }

            .choice-label {
                flex: 1;
                padding: 4px 6px;
                border-radius: 6px;
                border: 1px solid #ccc;
            }

            .choice-target {
                padding: 4px;
            }

            .add-choice, .remove-choice {
                padding: 2px 8px;
                font-size: 12px;
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
        const project = await projectRepository.load()

        this.dialogs = project.dialogs
        this.flags = project.flags

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

    private buildPage(page: DialogPage, index: number, count: number): HTMLElement {
        const row = Dom.div('page')
        const body = Dom.div('page-body')
        const area = Dom.inputTextArea('page-text')
        const fit = Dom.span('', 'fit')

        area.value = page.text
        area.dataset.index = String(index)
        area.placeholder = 'What the sign says on this page…'
        this.showFit(area, fit)
        body.append(area, fit, this.buildFlagRow(page, index), this.buildChoices(page, index))

        const remove = Dom.button('×', 'remove-page')

        remove.title = 'Remove this page'
        remove.dataset.index = String(index)
        remove.disabled = count <= 1

        row.append(Dom.span(String(index + 1) + '.', 'page-number'), body, remove)

        return row
    }

    /** Which story flag the page sets when shown (T-050): how a conversation opens a gate. */
    private buildFlagRow(page: DialogPage, index: number): HTMLElement {
        const row = Dom.div('page-flag-row')
        const select = document.createElement('select')
        const none = document.createElement('option')

        select.className = 'page-flag'
        select.dataset.index = String(index)
        none.value = ''
        none.textContent = 'sets no flag'
        none.selected = page.setsFlagId === undefined
        select.append(none)

        for (const flag of this.flags) {
            select.append(new Option('sets ' + flag.name, flag.id, false, flag.id === page.setsFlagId))
        }

        row.append(Dom.span('When shown:'), select)

        return row
    }

    /** The page's choices, each a label and where it leads, plus an add button while there is room. */
    private buildChoices(page: DialogPage, index: number): HTMLElement {
        const choices = Dom.div('choices')

        page.choices.forEach((choice, choiceIndex) => {
            const row = Dom.div('choice')
            const label = document.createElement('input')
            const target = document.createElement('select')
            const remove = Dom.button('×', 'remove-choice')

            label.className = 'choice-label'
            label.placeholder = 'Choice label'
            label.value = choice.label
            label.dataset.index = String(index)
            label.dataset.choice = String(choiceIndex)

            target.className = 'choice-target'
            target.dataset.index = String(index)
            target.dataset.choice = String(choiceIndex)

            const end = document.createElement('option')

            end.value = ''
            end.textContent = 'ends the conversation'
            end.selected = choice.nextDialogId === null
            target.append(end)

            for (const dialog of this.dialogs) {
                const option = document.createElement('option')

                option.value = dialog.id
                option.textContent = '→ ' + dialog.name
                option.selected = dialog.id === choice.nextDialogId
                target.append(option)
            }

            remove.title = 'Remove this choice'
            remove.dataset.index = String(index)
            remove.dataset.choice = String(choiceIndex)
            row.append(Dom.span('▶'), label, target, remove)
            choices.append(row)
        })

        if (page.choices.length < MAX_CHOICES) {
            const add = Dom.button(page.choices.length === 0 ? '+ Choice' : '+ Another choice', 'add-choice')

            add.dataset.index = String(index)
            add.title = 'Offer the player a choice on this page'
            choices.append(add)
        }

        return choices
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

    private indexOf(target: EventTarget | null, key: 'index' | 'choice' = 'index'): number | undefined {
        const index = target instanceof HTMLElement ? Number(target.dataset[key]) : NaN

        return Number.isInteger(index) ? index : undefined
    }

    private withPage(index: number, change: (page: DialogPage) => DialogPage): Dialog | undefined {
        return this.dialog === undefined ? undefined : { ...this.dialog, pages: this.dialog.pages.map((page, each) => (each === index ? change(page) : page)) }
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

        const created = await projectRepository.createDialog({ name: name.trim(), pages: [newPage('')] })

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

        const changed = this.withPage(index, page => ({ ...page, text: area.value }))

        if (changed !== undefined) {
            await this.save(changed)
        }
    }

    private async handleAddPage(): Promise<void> {
        if (this.dialog === undefined) {
            return
        }

        await this.save({ ...this.dialog, pages: [...this.dialog.pages, newPage('')] })
    }

    private async handleRemovePage(event: Event): Promise<void> {
        const index = this.indexOf(event.target)

        if (this.dialog === undefined || index === undefined || this.dialog.pages.length <= 1) {
            return
        }

        await this.save({ ...this.dialog, pages: this.dialog.pages.filter((_page, each) => each !== index) })
    }

    private async handleAddChoice(event: Event): Promise<void> {
        const index = this.indexOf(event.target)
        const changed = index === undefined ? undefined : this.withPage(index, page => (
            page.choices.length >= MAX_CHOICES ? page : { ...page, choices: [...page.choices, { label: page.choices.length === 0 ? 'Yes' : page.choices.length === 1 ? 'No' : '', nextDialogId: null }] }
        ))

        if (changed !== undefined) {
            await this.save(changed)
        }
    }

    private async handleRemoveChoice(event: Event): Promise<void> {
        const index = this.indexOf(event.target)
        const choiceIndex = this.indexOf(event.target, 'choice')
        const changed = index === undefined || choiceIndex === undefined ? undefined : this.withPage(index, page => (
            { ...page, choices: page.choices.filter((_choice, each) => each !== choiceIndex) }
        ))

        if (changed !== undefined) {
            await this.save(changed)
        }
    }

    /** Reads the whole row the changed control sits in, so label and target save together. */
    private async handlePageFlagChange(event: Event): Promise<void> {
        const control = event.target
        const index = this.indexOf(control)

        if (index === undefined || !(control instanceof HTMLSelectElement)) {
            return
        }

        const changed = this.withPage(index, page => {
            const { setsFlagId: _dropped, ...rest } = page

            return control.value === '' ? rest : { ...rest, setsFlagId: control.value }
        })

        if (changed !== undefined) {
            await this.save(changed)
        }
    }

    private async handleChoiceChange(event: Event): Promise<void> {
        const control = event.target
        const index = this.indexOf(control)
        const choiceIndex = this.indexOf(control, 'choice')
        const row = control instanceof HTMLElement ? control.closest('.choice') : null
        const label = row?.querySelector('.choice-label')
        const target = row?.querySelector('.choice-target')

        if (index === undefined || choiceIndex === undefined || !(label instanceof HTMLInputElement) || !(target instanceof HTMLSelectElement)) {
            return
        }

        const choice: Choice = { label: label.value, nextDialogId: target.value === '' ? null : target.value }
        const changed = this.withPage(index, page => ({ ...page, choices: page.choices.map((each, at) => (at === choiceIndex ? choice : each)) }))

        if (changed !== undefined) {
            await this.save(changed)
        }
    }
}
