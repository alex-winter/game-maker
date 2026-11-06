import { Component, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { projectRepository } from 'Client/Service/Repository/ProjectRepository'
import { Cell } from 'domain/coordinates'
import { Id } from 'domain/id'
import { Metatile, MetatileId } from 'domain/tileset'
import { ItemEvent } from 'domain/warp'

type Named = { readonly id: Id; readonly name: string }

export type ItemFormDataset = {
    /** The item event being edited, or null to place one on `cell`. */
    event: ItemEvent | null

    cell: Cell

    items: Named[]

    flags: Named[]

    /** The map's tileset metatiles the item can look like. */
    metatiles: Metatile[]

    /** Sheet image URLs by sheet id, for the metatile preview. */
    sheetSources: { [sheetId: string]: string }
}

export const ITEM_SUBMIT = 'item-submit'

export const ITEM_DELETE = 'item-delete'

/**
 * One item on the ground, inside `BasicModal`: which item, which flag
 * remembers it was taken (a button makes a fitting new flag), and which
 * metatile draws it. Emits `item-submit` (id-less for a new one) or
 * `item-delete` with the event id.
 */
export class ItemForm extends Component<ItemFormDataset> {
    private flags: Named[] = []

    protected listeners: Listeners = {
        '.submit-button:click': this.handleSubmit,
        'form:submit': this.handleSubmit,
        '.delete-button:click': this.handleDelete,
        '.new-flag:click': this.handleNewFlag,
        '.metatile-select:change': this.handlePreview,
    }

    protected css(): string {
        return /*css*/`
            .form-container {
                font-family: 'Segoe UI', sans-serif;
                background: #fff;
                padding: 24px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                width: 380px;
                display: flex;
                flex-direction: column;
                gap: 14px;
            }

            h3 {
                margin: 0;
                font-size: 16px;
                color: #333;
            }

            .form-group {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .form-label {
                font-weight: 600;
                color: #333;
                font-size: 13px;
            }

            .row {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .row select {
                flex: 1;
            }

            select {
                padding: 8px 10px;
                font-size: 14px;
                border-radius: 8px;
                border: 1px solid #ccc;
            }

            .new-flag {
                padding: 8px 10px;
                border-radius: 8px;
                border: 1px solid #ccc;
                background: #fff;
                cursor: pointer;
                white-space: nowrap;
            }

            .preview {
                width: 48px;
                height: 48px;
                image-rendering: pixelated;
                background: #e8e8e8;
                border-radius: 4px;
            }

            .hint {
                font-size: 12px;
                color: #777;
            }

            .error {
                font-size: 13px;
                color: #c0392b;
                min-height: 1em;
            }

            .buttons {
                display: flex;
                gap: 8px;
            }

            .submit-button {
                flex: 1;
                padding: 12px 16px;
                border: none;
                background-color: #007bff;
                color: white;
                font-size: 15px;
                font-weight: 600;
                border-radius: 8px;
                cursor: pointer;
            }

            .submit-button:disabled {
                background-color: #9bc3ec;
                cursor: default;
            }

            .delete-button {
                padding: 12px 16px;
                border: 1px solid #c0392b;
                background: #fff;
                color: #c0392b;
                font-size: 14px;
                border-radius: 8px;
                cursor: pointer;
            }
        `
    }

    protected async setup(): Promise<void> {
        this.flags = this.parsedDataset.flags
    }

    protected build(): HTMLElement {
        const form = document.createElement('form')
        const { event, cell, items, metatiles } = this.parsedDataset
        const title = document.createElement('h3')

        form.className = 'form-container'
        title.textContent = `${event === null ? 'New item' : 'Item'} at ${cell.x}, ${cell.y}`

        const itemSelect = this.select('item-select', items, event?.itemId ?? items[0]?.id ?? null, 'This project has no items yet')
        const flagSelect = this.select('flag-select', this.flags, event?.flagId ?? null, 'No flags yet: make one')
        const flagRow = Dom.div('row')

        flagRow.append(flagSelect, Dom.button('+ New flag', 'new-flag'))

        const metatileSelect = document.createElement('select')
        const none = document.createElement('option')

        metatileSelect.className = 'metatile-select'
        none.value = ''
        none.textContent = 'invisible (no picture)'
        none.selected = event === null || event.metatileId === null
        metatileSelect.append(none)

        for (const metatile of metatiles) {
            const option = document.createElement('option')

            option.value = String(metatile.id)
            option.textContent = 'Metatile #' + metatile.id
            option.selected = metatile.id === event?.metatileId
            metatileSelect.append(option)
        }

        const metatileRow = Dom.div('row')
        const preview = Dom.canvas(48, 48)

        preview.className = 'preview'
        metatileRow.append(metatileSelect, preview)

        const submit = Dom.button(event === null ? 'Place item' : 'Save item', 'submit-button')

        submit.disabled = items.length === 0

        const buttons = Dom.div('buttons')

        buttons.append(submit)

        if (event !== null) {
            buttons.append(Dom.button('Delete', 'delete-button'))
        }

        form.append(
            title,
            this.group('Item', itemSelect),
            this.group('Flag set when taken', flagRow),
            Dom.span('The item is gone while this flag is set. Each item on the ground wants its own flag.', 'hint'),
            this.group('Looks like', metatileRow),
            Dom.span('', 'error'),
            buttons,
        )
        this.paintPreview(preview, this.selectedMetatile(metatileSelect.value))

        return form
    }

    private group(label: string, control: HTMLElement): HTMLElement {
        const group = Dom.div('form-group')

        group.append(Dom.label(label, 'form-label'), control)

        return group
    }

    private select(className: string, options: readonly Named[], selectedId: Id | null, emptyText: string): HTMLSelectElement {
        const select = document.createElement('select')

        select.className = className

        for (const option of options) {
            const element = document.createElement('option')

            element.value = option.id
            element.textContent = option.name
            element.selected = option.id === selectedId
            select.append(element)
        }

        if (options.length === 0) {
            const element = document.createElement('option')

            element.textContent = emptyText
            select.append(element)
            select.disabled = true
        }

        return select
    }

    private selectedMetatile(value: string): Metatile | undefined {
        const id: MetatileId = Number(value)

        return value === '' ? undefined : this.parsedDataset.metatiles.find(metatile => metatile.id === id)
    }

    private paintPreview(canvas: HTMLCanvasElement, metatile: Metatile | undefined): void {
        const ctx = canvas.getContext('2d')

        if (ctx === null) {
            return
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const source = metatile === undefined ? undefined : this.parsedDataset.sheetSources[metatile.sheetId]

        if (metatile === undefined || source === undefined) {
            return
        }

        const image = new Image()

        image.onload = () => {
            ctx.imageSmoothingEnabled = false
            ctx.drawImage(image, metatile.x, metatile.y, metatile.w, metatile.h, 0, 0, canvas.width, canvas.height)
        }
        image.src = source
    }

    private handlePreview(): void {
        const canvas = this.findOne<HTMLCanvasElement>('.preview')
        const select = this.findOne<HTMLSelectElement>('.metatile-select')

        if (canvas && select) {
            this.paintPreview(canvas, this.selectedMetatile(select.value))
        }
    }

    /** Makes a flag named after the chosen item and selects it, so placing an item is one visit to this form. */
    private async handleNewFlag(event: Event): Promise<void> {
        event.preventDefault()

        const itemSelect = this.findOne<HTMLSelectElement>('.item-select')
        const item = this.parsedDataset.items.find(each => each.id === itemSelect?.value)
        const { cell } = this.parsedDataset
        const suggested = `Took ${item?.name ?? 'item'} at ${cell.x}, ${cell.y}`
        const name = window.prompt('Flag name', suggested)

        if (name === null || name.trim() === '') {
            return
        }

        const flag = await projectRepository.createFlag(name.trim())
        const flagSelect = this.findOne<HTMLSelectElement>('.flag-select')

        this.flags = [...this.flags, flag]

        if (flagSelect) {
            if (flagSelect.disabled) {
                flagSelect.replaceChildren()
                flagSelect.disabled = false
            }

            const option = document.createElement('option')

            option.value = flag.id
            option.textContent = flag.name
            flagSelect.append(option)
            flagSelect.value = flag.id
        }
    }

    private handleSubmit(event: Event): void {
        event.preventDefault()

        const error = this.findOne('.error')
        const itemId = this.findOne<HTMLSelectElement>('.item-select')?.value
        const flagSelect = this.findOne<HTMLSelectElement>('.flag-select')
        const flagId = flagSelect?.disabled ? undefined : flagSelect?.value
        const metatile = this.selectedMetatile(this.findOne<HTMLSelectElement>('.metatile-select')?.value ?? '')

        if (!this.parsedDataset.items.some(item => item.id === itemId) || itemId === undefined) {
            if (error) error.textContent = 'Add an item to the catalog first.'
            return
        }

        if (flagId === undefined || !this.flags.some(flag => flag.id === flagId)) {
            if (error) error.textContent = 'Pick or make the flag that remembers this item was taken.'
            return
        }

        Events.emit('close-modal', this)
        Events.emit<Omit<ItemEvent, 'id'> & { id: Id | null }>(ITEM_SUBMIT, {
            kind: 'item',
            id: this.parsedDataset.event?.id ?? null,
            cell: this.parsedDataset.cell,
            itemId,
            flagId,
            metatileId: metatile?.id ?? null,
        })
    }

    private handleDelete(event: Event): void {
        event.preventDefault()

        const existing = this.parsedDataset.event

        if (existing === null) {
            return
        }

        Events.emit('close-modal', this)
        Events.emit(ITEM_DELETE, existing.id)
    }
}
