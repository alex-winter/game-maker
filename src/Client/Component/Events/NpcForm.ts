import { Component, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { Cell } from 'domain/coordinates'
import { Id } from 'domain/id'
import { Direction, isDirection } from 'domain/movement'
import { isNpcBehavior, NPC_BEHAVIORS, NpcEvent } from 'domain/warp'

type Named = { readonly id: Id; readonly name: string }

export type NpcFormDataset = {
    /** The person being edited, or null to place one on `cell`. */
    npc: NpcEvent | null

    cell: Cell

    sprites: Named[]

    dialogs: Named[]
}

export const NPC_SUBMIT = 'npc-submit'

export const NPC_DELETE = 'npc-delete'

const FACINGS: readonly Direction[] = ['down', 'up', 'left', 'right']

const BEHAVIOR_LABELS: { readonly [B in NpcEvent['behavior']]: string } = {
    still: 'stands still',
    look: 'looks around',
    wander: 'wanders nearby',
}

/**
 * One person, inside `BasicModal`: name, sprite (or a stand-in), facing,
 * what they do when left alone, and the dialog they speak. Emits `npc-submit` (id-less for a new one) or
 * `npc-delete` with the event id.
 */
export class NpcForm extends Component<NpcFormDataset> {
    protected listeners: Listeners = {
        '.submit-button:click': this.handleSubmit,
        'form:submit': this.handleSubmit,
        '.delete-button:click': this.handleDelete,
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

            .row {
                display: flex;
                gap: 12px;
            }

            .form-group {
                display: flex;
                flex-direction: column;
                gap: 6px;
                flex: 1;
            }

            .form-label {
                font-weight: 600;
                color: #333;
                font-size: 13px;
            }

            select, input {
                padding: 8px 10px;
                font-size: 14px;
                border-radius: 8px;
                border: 1px solid #ccc;
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
        const { npc, cell, sprites, dialogs } = this.parsedDataset
        const title = document.createElement('h3')
        const name = document.createElement('input')

        form.className = 'form-container'
        title.textContent = `${npc === null ? 'New person' : npc.name} at ${cell.x}, ${cell.y}`
        name.className = 'name-input'
        name.placeholder = 'Name'
        name.value = npc?.name ?? ''

        const spriteSelect = this.select('sprite-select', [{ id: '', name: 'stand-in rectangle' }, ...sprites], npc?.spriteId ?? '')
        const facingSelect = this.select('facing-select', FACINGS.map(facing => ({ id: facing, name: facing })), npc?.facing ?? 'down')
        const dialogSelect = this.select('dialog-select', [{ id: '', name: 'nothing to say yet' }, ...dialogs], npc?.dialogId ?? '')
        const behaviorSelect = this.select('behavior-select', NPC_BEHAVIORS.map(behavior => ({ id: behavior, name: BEHAVIOR_LABELS[behavior] })), npc?.behavior ?? 'still')
        const row = Dom.div('row')

        row.append(this.group('Looks like', spriteSelect), this.group('Facing', facingSelect))

        const buttons = Dom.div('buttons')

        buttons.append(Dom.button(npc === null ? 'Place person' : 'Save person', 'submit-button'))

        if (npc !== null) {
            buttons.append(Dom.button('Delete', 'delete-button'))
        }

        form.append(title, this.group('Name', name), row, this.group('Does', behaviorSelect), this.group('Says', dialogSelect), Dom.span('', 'error'), buttons)

        return form
    }

    private group(label: string, control: HTMLElement): HTMLElement {
        const group = Dom.div('form-group')

        group.append(Dom.label(label, 'form-label'), control)

        return group
    }

    private select(className: string, options: readonly Named[], selectedId: string): HTMLSelectElement {
        const select = document.createElement('select')

        select.className = className

        for (const option of options) {
            const element = document.createElement('option')

            element.value = option.id
            element.textContent = option.name
            element.selected = option.id === selectedId
            select.append(element)
        }

        return select
    }

    private handleSubmit(event: Event): void {
        event.preventDefault()

        const error = this.findOne('.error')
        const name = this.findOne<HTMLInputElement>('.name-input')?.value.trim() ?? ''
        const spriteId = this.findOne<HTMLSelectElement>('.sprite-select')?.value ?? ''
        const facing = this.findOne<HTMLSelectElement>('.facing-select')?.value
        const dialogId = this.findOne<HTMLSelectElement>('.dialog-select')?.value ?? ''
        const behavior = this.findOne<HTMLSelectElement>('.behavior-select')?.value

        if (name === '') {
            if (error) error.textContent = 'Give them a name.'
            return
        }

        if (!isDirection(facing)) {
            if (error) error.textContent = 'Pick a facing.'
            return
        }

        if (!isNpcBehavior(behavior)) {
            if (error) error.textContent = 'Pick what they do.'
            return
        }

        Events.emit('close-modal', this)
        Events.emit<Omit<NpcEvent, 'id'> & { id: Id | null }>(NPC_SUBMIT, {
            kind: 'npc',
            id: this.parsedDataset.npc?.id ?? null,
            cell: this.parsedDataset.cell,
            name,
            spriteId: spriteId === '' ? null : spriteId,
            facing,
            dialogId: dialogId === '' ? null : dialogId,
            behavior,
        })
    }

    private handleDelete(event: Event): void {
        event.preventDefault()

        const npc = this.parsedDataset.npc

        if (npc === null) {
            return
        }

        Events.emit('close-modal', this)
        Events.emit(NPC_DELETE, npc.id)
    }
}
