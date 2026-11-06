import { Component, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { Cell } from 'domain/coordinates'
import { Id } from 'domain/id'
import { Direction, isDirection } from 'domain/movement'
import { isNpcBehavior, MAX_SIGHT_RANGE, NPC_BEHAVIORS, NpcEvent, Trainer } from 'domain/warp'
import { MAX_LEVEL, MIN_LEVEL } from 'domain/creature'
import { projectRepository } from 'Client/Service/Repository/ProjectRepository'

type Named = { readonly id: Id; readonly name: string }

export type NpcFormDataset = {
    /** The person being edited, or null to place one on `cell`. */
    npc: NpcEvent | null

    cell: Cell

    sprites: Named[]

    dialogs: Named[]

    /** Flags a trainer can set once beaten (T-049). */
    flags: Named[]

    /** Species a trainer can send out (T-049). */
    species: Named[]
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
 * what they do when left alone, the dialog they speak, and (T-049) whether
 * they are a trainer: how far they see, the flag a win sets, and what they
 * send out. Emits `npc-submit` (id-less for a new one) or `npc-delete`
 * with the event id.
 */
export class NpcForm extends Component<NpcFormDataset> {
    protected listeners: Listeners = {
        '.submit-button:click': this.handleSubmit,
        'form:submit': this.handleSubmit,
        '.delete-button:click': this.handleDelete,
        '.trainer-toggle:change': this.handleTrainerToggle,
        '.new-flag:click': this.handleNewFlag,
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

            .trainer {
                display: flex;
                flex-direction: column;
                gap: 10px;
                padding: 10px;
                border: 1px solid #e3e3e3;
                border-radius: 8px;
            }

            .trainer[hidden] {
                display: none;
            }

            .toggle-row {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                color: #333;
            }

            .toggle-row input {
                padding: 0;
            }

            .flag-row {
                display: flex;
                gap: 6px;
            }

            .flag-row select {
                flex: 1;
            }

            .new-flag {
                padding: 6px 10px;
                border: 1px solid #ccc;
                background: #fff;
                border-radius: 8px;
                cursor: pointer;
                font-size: 13px;
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
        const { npc, cell, sprites, dialogs, flags, species } = this.parsedDataset
        const title = document.createElement('h3')
        const name = document.createElement('input')

        this.flags = flags

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

        form.append(title, this.group('Name', name), row, this.group('Does', behaviorSelect), this.group('Says', dialogSelect), this.trainerSection(npc?.trainer ?? null, species), Dom.span('', 'error'), buttons)

        return form
    }

    /** The trainer fields: a checkbox, and beneath it sight range, defeated flag (with "+ New"), creature and level. Hidden until ticked. */
    private trainerSection(trainer: Trainer | null, species: readonly Named[]): HTMLElement {
        const wrapper = Dom.div('trainer-wrapper')
        const toggleRow = document.createElement('label')
        const toggle = document.createElement('input')
        const fields = Dom.div('trainer')
        const range = document.createElement('input')
        const level = document.createElement('input')
        const flagRow = Dom.div('flag-row')
        const flagSelect = this.select('flag-select', this.flags, trainer?.defeatedFlagId ?? '')
        const speciesSelect = this.select('species-select', [{ id: '', name: 'nothing to send out' }, ...species], trainer?.speciesId ?? '')
        const pair = Dom.div('row')

        toggleRow.className = 'toggle-row'
        toggle.type = 'checkbox'
        toggle.className = 'trainer-toggle'
        toggle.checked = trainer !== null
        toggleRow.append(toggle, document.createTextNode('Challenges the player when they walk into view'))

        range.type = 'number'
        range.className = 'sight-range'
        range.min = '1'
        range.max = String(MAX_SIGHT_RANGE)
        range.value = String(trainer?.sightRange ?? 3)

        level.type = 'number'
        level.className = 'trainer-level'
        level.min = String(MIN_LEVEL)
        level.max = String(MAX_LEVEL)
        level.value = String(trainer?.level ?? 5)

        if (this.flags.length === 0) {
            flagSelect.append(new Option('no flags yet', ''))
            flagSelect.disabled = true
        }

        flagRow.append(flagSelect, Dom.button('+ New', 'new-flag'))
        pair.append(this.group('Sees (cells)', range), this.group('Level', level))
        fields.append(pair, this.group('Beaten flag', flagRow), this.group('Sends out', speciesSelect))
        fields.hidden = trainer === null
        wrapper.append(toggleRow, fields)

        return wrapper
    }

    private handleTrainerToggle(): void {
        const fields = this.findOne<HTMLElement>('.trainer')
        const toggle = this.findOne<HTMLInputElement>('.trainer-toggle')

        if (fields && toggle) {
            fields.hidden = !toggle.checked
        }
    }

    /** Makes a flag named after the trainer and selects it, so marking a trainer is one visit to this form. */
    private async handleNewFlag(event: Event): Promise<void> {
        event.preventDefault()

        const who = this.findOne<HTMLInputElement>('.name-input')?.value.trim() ?? ''
        const name = window.prompt('Flag name', `Beat ${who === '' ? 'trainer' : who}`)

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

    /** The trainer fields read back, or an error message when the box is ticked but the fields do not add up. */
    private readTrainer(): Trainer | null | string {
        if (this.findOne<HTMLInputElement>('.trainer-toggle')?.checked !== true) {
            return null
        }

        const sightRange = Number(this.findOne<HTMLInputElement>('.sight-range')?.value)
        const level = Number(this.findOne<HTMLInputElement>('.trainer-level')?.value)
        const defeatedFlagId = this.findOne<HTMLSelectElement>('.flag-select')?.value ?? ''
        const speciesId = this.findOne<HTMLSelectElement>('.species-select')?.value ?? ''

        if (!Number.isInteger(sightRange) || sightRange < 1 || sightRange > MAX_SIGHT_RANGE) {
            return `Sight range is 1 to ${MAX_SIGHT_RANGE} cells.`
        }

        if (!Number.isInteger(level) || level < MIN_LEVEL || level > MAX_LEVEL) {
            return `Level is ${MIN_LEVEL} to ${MAX_LEVEL}.`
        }

        if (defeatedFlagId === '') {
            return 'Pick the flag set once they are beaten.'
        }

        return { sightRange, defeatedFlagId, speciesId: speciesId === '' ? null : speciesId, level }
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

        const trainer = this.readTrainer()

        if (typeof trainer === 'string') {
            if (error) error.textContent = trainer
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
            trainer,
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
