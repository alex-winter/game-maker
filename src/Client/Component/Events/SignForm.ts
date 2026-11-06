import { Component, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { Cell } from 'domain/coordinates'
import { Id } from 'domain/id'
import { Sign } from 'domain/warp'

type DialogOption = { readonly id: Id; readonly name: string; readonly firstPage: string }

export type SignFormDataset = {
    /** The sign being edited, or null to place one on `cell`. */
    sign: Sign | null

    cell: Cell

    dialogs: DialogOption[]
}

export const SIGN_SUBMIT = 'sign-submit'

export const SIGN_DELETE = 'sign-delete'

/** The whole sign form just asked to open the dialog editor; the host opens it for `dialogId`. */
export const OPEN_DIALOG_EDITOR = 'open-dialog-editor'

/**
 * One sign, inside `BasicModal`: which dialog it shows. Emits `sign-submit`
 * with the sign's fields (id-less for a new one) or `sign-delete` with the
 * sign id. A link opens the dialog editor when the project has nothing to say yet.
 */
export class SignForm extends Component<SignFormDataset> {
    protected listeners: Listeners = {
        '.submit-button:click': this.handleSubmit,
        'form:submit': this.handleSubmit,
        '.delete-button:click': this.handleDelete,
        '.dialog-select:change': this.handlePreview,
        '.edit-dialogs:click': this.handleEditDialogs,
    }

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
            }

            .preview {
                font-family: monospace;
                font-size: 12px;
                color: #30304a;
                background: #f8f4e8;
                border: 2px solid #30304a;
                border-radius: 4px;
                padding: 6px 8px;
                min-height: 2.6em;
                white-space: pre-wrap;
            }

            .edit-dialogs {
                align-self: flex-start;
                background: none;
                border: none;
                padding: 0;
                color: #007bff;
                cursor: pointer;
                font-size: 13px;
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

    protected build(): HTMLElement {
        const form = document.createElement('form')
        const { sign, cell, dialogs } = this.parsedDataset
        const title = document.createElement('h3')
        const select = document.createElement('select')
        const chosen = dialogs.find(dialog => dialog.id === sign?.dialogId) ?? dialogs[0]

        form.className = 'form-container'
        title.textContent = `${sign === null ? 'New sign' : 'Sign'} at ${cell.x}, ${cell.y}`
        select.className = 'dialog-select'

        for (const dialog of dialogs) {
            const option = document.createElement('option')

            option.value = dialog.id
            option.textContent = dialog.name
            option.selected = dialog.id === chosen?.id
            select.append(option)
        }

        if (dialogs.length === 0) {
            const option = document.createElement('option')

            option.textContent = 'This project has no dialogs yet'
            select.append(option)
            select.disabled = true
        }

        const group = Dom.div('form-group')

        group.append(Dom.label('Dialog', 'form-label'), select)

        const edit = Dom.button(dialogs.length === 0 ? 'Write a dialog first…' : 'Edit dialogs…', 'edit-dialogs')
        const submit = Dom.button(sign === null ? 'Place sign' : 'Save sign', 'submit-button')

        submit.disabled = dialogs.length === 0

        const buttons = Dom.div('buttons')

        buttons.append(submit)

        if (sign !== null) {
            buttons.append(Dom.button('Delete', 'delete-button'))
        }

        form.append(title, group, Dom.div('preview'), edit, Dom.span('', 'error'), buttons)
        this.writePreview(form.querySelector('.preview'), chosen)

        return form
    }

    private selectedDialog(): DialogOption | undefined {
        const id = this.findOne<HTMLSelectElement>('.dialog-select')?.value

        return this.parsedDataset.dialogs.find(dialog => dialog.id === id)
    }

    private writePreview(preview: Element | null, dialog: DialogOption | undefined): void {
        if (preview instanceof HTMLElement) {
            preview.textContent = dialog === undefined ? '' : dialog.firstPage
        }
    }

    private handlePreview(): void {
        this.writePreview(this.findOne('.preview'), this.selectedDialog())
    }

    private handleEditDialogs(event: Event): void {
        event.preventDefault()
        Events.emit('close-modal', this)
        Events.emit<Id | undefined>(OPEN_DIALOG_EDITOR, this.selectedDialog()?.id)
    }

    private handleSubmit(event: Event): void {
        event.preventDefault()

        const dialog = this.selectedDialog()

        if (dialog === undefined) {
            const error = this.findOne('.error')

            if (error) error.textContent = 'Write a dialog first, then attach it here.'
            return
        }

        Events.emit('close-modal', this)
        Events.emit<Omit<Sign, 'id'> & { id: Id | null }>(SIGN_SUBMIT, {
            kind: 'sign',
            id: this.parsedDataset.sign?.id ?? null,
            cell: this.parsedDataset.cell,
            dialogId: dialog.id,
        })
    }

    private handleDelete(event: Event): void {
        event.preventDefault()

        const sign = this.parsedDataset.sign

        if (sign === null) {
            return
        }

        Events.emit('close-modal', this)
        Events.emit(SIGN_DELETE, sign.id)
    }
}
