import { Component, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { projectRepository } from 'Client/Service/Repository/ProjectRepository'
import { Cell } from 'domain/coordinates'
import { Id } from 'domain/id'
import { Gate } from 'domain/map'
import { Metatile } from 'domain/tileset'

type Named = { readonly id: Id; readonly name: string }

export type GateFormDataset = {
    /** The gate on the cell, or null to place one. */
    gate: Gate | null

    cell: Cell

    flags: Named[]

    /** The map's tileset metatiles the open gate can show. */
    metatiles: Metatile[]

    /** Sheet image URLs by sheet id, for the metatile preview. */
    sheetSources: { [sheetId: string]: string }
}

/** `{ cell, gate }` with the gate to store on the cell. */
export const GATE_SUBMIT = 'gate-submit'

/** The cell whose gate goes. */
export const GATE_REMOVE = 'gate-remove'

export type GateSubmission = { readonly cell: Cell; readonly gate: Gate }

/**
 * One field gate (T-050), inside `BasicModal`: the flag that opens the cell
 * and the metatile shown once it has (a stump for a tree). Emits
 * `gate-submit` or `gate-remove` with the cell.
 */
export class GateForm extends Component<GateFormDataset> {
    protected listeners: Listeners = {
        '.submit-button:click': this.handleSubmit,
        'form:submit': this.handleSubmit,
        '.remove-button:click': this.handleRemove,
        '.new-flag:click': this.handleNewFlag,
        '.metatile-select:change': this.handlePreview,
    }

    private flags: Named[] = []

    protected css(): string {
        return /*css*/`
            .form-container {
                font-family: 'Segoe UI', sans-serif;
                background: #fff;
                padding: 24px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                width: 360px;
                display: flex;
                flex-direction: column;
                gap: 14px;
            }

            h3 {
                margin: 0;
                font-size: 16px;
                color: #333;
            }

            p {
                margin: 0;
                font-size: 13px;
                color: #666;
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

            select {
                padding: 8px 10px;
                font-size: 14px;
                border-radius: 8px;
                border: 1px solid #ccc;
                flex: 1;
            }

            .row {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .new-flag {
                padding: 8px 10px;
                border: 1px solid #ccc;
                background: #fff;
                border-radius: 8px;
                cursor: pointer;
                font-size: 13px;
            }

            .preview {
                width: 48px;
                height: 48px;
                image-rendering: pixelated;
                border: 1px solid #ddd;
                background: #f4f4f4;
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

            .remove-button {
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

    protected build(): HTMLElement {
        const form = document.createElement('form')
        const { gate, cell, flags, metatiles } = this.parsedDataset
        const title = document.createElement('h3')
        const hint = document.createElement('p')
        const flagSelect = document.createElement('select')
        const flagRow = Dom.div('row')
        const metatileSelect = document.createElement('select')
        const none = document.createElement('option')
        const preview = document.createElement('canvas')
        const metatileRow = Dom.div('row')
        const buttons = Dom.div('buttons')

        this.flags = flags
        form.className = 'form-container'
        title.textContent = `${gate === null ? 'New gate' : 'Gate'} at ${cell.x}, ${cell.y}`
        hint.textContent = 'The cell is a wall until the flag is set. A dialog page can set it.'

        flagSelect.className = 'flag-select'

        if (flags.length === 0) {
            flagSelect.append(new Option('no flags yet', ''))
            flagSelect.disabled = true
        }

        for (const flag of flags) {
            flagSelect.append(new Option(flag.name, flag.id, false, flag.id === gate?.flagId))
        }

        flagRow.append(flagSelect, Dom.button('+ New flag', 'new-flag'))

        metatileSelect.className = 'metatile-select'
        none.value = ''
        none.textContent = 'keep the picture as painted'
        none.selected = gate === null || gate.openMetatileId === null
        metatileSelect.append(none)

        for (const metatile of metatiles) {
            metatileSelect.append(new Option('Metatile #' + metatile.id, String(metatile.id), false, metatile.id === gate?.openMetatileId))
        }

        preview.className = 'preview'
        preview.width = 16
        preview.height = 16
        metatileRow.append(metatileSelect, preview)

        buttons.append(Dom.button(gate === null ? 'Place gate' : 'Save gate', 'submit-button'))

        if (gate !== null) {
            buttons.append(Dom.button('Remove', 'remove-button'))
        }

        form.append(title, hint, this.group('Opens with flag', flagRow), this.group('Shows when open', metatileRow), Dom.span('', 'error'), buttons)
        this.paintPreview(preview, this.selectedMetatile(metatileSelect.value))

        return form
    }

    private group(label: string, control: HTMLElement): HTMLElement {
        const group = Dom.div('form-group')

        group.append(Dom.label(label, 'form-label'), control)

        return group
    }

    private selectedMetatile(value: string): Metatile | undefined {
        const id = Number(value)

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
            ctx.drawImage(image, metatile.x, metatile.y, metatile.w, metatile.h, 0, 0, canvas.width, canvas.height)
        }
        image.src = source
    }

    private handlePreview(): void {
        const select = this.findOne<HTMLSelectElement>('.metatile-select')
        const preview = this.findOne<HTMLCanvasElement>('.preview')

        if (select && preview) {
            this.paintPreview(preview, this.selectedMetatile(select.value))
        }
    }

    /** Makes a flag named for the cell and selects it, so placing a gate is one visit to this form. */
    private async handleNewFlag(event: Event): Promise<void> {
        event.preventDefault()

        const { cell } = this.parsedDataset
        const name = window.prompt('Flag name', `Opened gate at ${cell.x}, ${cell.y}`)

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

            flagSelect.append(new Option(flag.name, flag.id))
            flagSelect.value = flag.id
        }
    }

    private handleSubmit(event: Event): void {
        event.preventDefault()

        const error = this.findOne('.error')
        const flagId = this.findOne<HTMLSelectElement>('.flag-select')?.value ?? ''
        const metatile = this.selectedMetatile(this.findOne<HTMLSelectElement>('.metatile-select')?.value ?? '')

        if (flagId === '') {
            if (error) error.textContent = 'Pick the flag that opens it.'
            return
        }

        Events.emit('close-modal', this)
        Events.emit<GateSubmission>(GATE_SUBMIT, { cell: this.parsedDataset.cell, gate: { flagId, openMetatileId: metatile?.id ?? null } })
    }

    private handleRemove(event: Event): void {
        event.preventDefault()
        Events.emit('close-modal', this)
        Events.emit<Cell>(GATE_REMOVE, this.parsedDataset.cell)
    }
}
