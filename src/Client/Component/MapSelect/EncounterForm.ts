import { Component, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { MAX_LEVEL, MIN_LEVEL } from 'domain/creature'
import { EncounterEntry, EncounterTable } from 'domain/encounter'
import { Id } from 'domain/id'

type SpeciesOption = { readonly id: Id; readonly name: string }

export const ENCOUNTERS_SUBMIT = 'map-encounters-submit'

/**
 * One map's tall-grass encounter table (T-048), inside `BasicModal`: the
 * percent chance per step and a line per species with a level range and
 * a weight. Emits `map-encounters-submit` with the `EncounterTable`.
 */
export class EncounterForm extends Component<{ encounters: EncounterTable; species: SpeciesOption[] }> {
    private entries: EncounterEntry[] = []
    private rate = 0

    protected listeners: Listeners = {
        '.submit-button:click': this.handleSubmit,
        'form:submit': this.handleSubmit,
        '.add-entry:click': this.handleAddEntry,
        '.remove-entry:click': this.handleRemoveEntry,
    }

    protected css(): string {
        return /*css*/`
            .form-container {
                font-family: 'Segoe UI', sans-serif;
                background: #fff;
                padding: 24px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                width: 460px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            h3 {
                margin: 0;
                font-size: 16px;
                color: #333;
            }

            .rate, .entry {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .rate label, .hint {
                font-size: 13px;
                color: #555;
            }

            input, select {
                padding: 6px 8px;
                font-size: 14px;
                border-radius: 8px;
                border: 1px solid #ccc;
            }

            input[type=number] {
                width: 64px;
            }

            .entry select {
                flex: 1;
            }

            .header {
                display: flex;
                gap: 8px;
                font-size: 12px;
                color: #777;
            }

            .header span:first-child {
                flex: 1;
            }

            .header span {
                width: 64px;
            }

            .add-entry, .remove-entry {
                padding: 6px 10px;
                border-radius: 8px;
                border: 1px solid #ccc;
                background: #fff;
                cursor: pointer;
            }

            .empty {
                color: #777;
                font-size: 13px;
            }

            .submit-button {
                padding: 12px 16px;
                border: none;
                background-color: #007bff;
                color: white;
                font-size: 15px;
                font-weight: 600;
                border-radius: 8px;
                cursor: pointer;
            }
        `
    }

    protected async setup(): Promise<void> {
        this.entries = [...this.parsedDataset.encounters.entries]
        this.rate = this.parsedDataset.encounters.rate
    }

    protected build(): HTMLElement {
        const form = document.createElement('form')
        const title = document.createElement('h3')
        const rateRow = Dom.div('rate')
        const rate = document.createElement('input')

        form.className = 'form-container'
        title.textContent = 'Tall grass encounters'
        rate.type = 'number'
        rate.min = '0'
        rate.max = '100'
        rate.className = 'rate-input'
        rate.value = String(this.rate)
        rateRow.append(Dom.label('Chance per step onto grass', 'rate-label'), rate, Dom.span('%', 'hint'))
        form.append(title, rateRow)

        if (this.parsedDataset.species.length === 0) {
            form.append(Dom.span('No species yet — add some in the Creatures window first.', 'empty'))
        } else if (this.entries.length === 0) {
            form.append(Dom.span('Nothing lives here yet.', 'empty'))
        } else {
            const header = Dom.div('header')

            header.append(Dom.span('Species'), Dom.span('Min'), Dom.span('Max'), Dom.span('Weight'), Dom.span(''))
            form.append(header)

            for (const [index, entry] of this.entries.entries()) {
                form.append(this.entryRow(entry, index))
            }
        }

        const add = Dom.button('+ Species line', 'add-entry')

        add.type = 'button'
        add.disabled = this.parsedDataset.species.length === 0
        form.append(add, Dom.span('Weights are relative: 60, 30, and 10 are 60%, 30%, and 10% of what appears.', 'hint'), Dom.button('Save encounters', 'submit-button'))

        return form
    }

    private entryRow(entry: EncounterEntry, index: number): HTMLElement {
        const row = Dom.div('entry')
        const select = document.createElement('select')
        const remove = Dom.button('×', 'remove-entry')

        select.className = 'entry-species'

        for (const species of this.parsedDataset.species) {
            const option = document.createElement('option')

            option.value = species.id
            option.textContent = species.name
            option.selected = species.id === entry.speciesId
            select.append(option)
        }

        remove.type = 'button'
        remove.dataset.index = String(index)
        row.append(select, this.numberInput('entry-min', entry.minLevel, MIN_LEVEL, MAX_LEVEL), this.numberInput('entry-max', entry.maxLevel, MIN_LEVEL, MAX_LEVEL), this.numberInput('entry-weight', entry.weight, 0, 1000), remove)

        return row
    }

    private numberInput(className: string, value: number, min: number, max: number): HTMLInputElement {
        const input = document.createElement('input')

        input.type = 'number'
        input.className = className
        input.min = String(min)
        input.max = String(max)
        input.value = String(value)

        return input
    }

    /** The rows as they stand, so adding or removing a line keeps the edits in the others. */
    private readEntries(): EncounterEntry[] {
        const species = this.findAll<HTMLSelectElement>('.entry-species')
        const mins = this.findAll<HTMLInputElement>('.entry-min')
        const maxes = this.findAll<HTMLInputElement>('.entry-max')
        const weights = this.findAll<HTMLInputElement>('.entry-weight')

        return species.map((select, index) => ({
            speciesId: select.value,
            minLevel: clamp(Number(mins[index]?.value), MIN_LEVEL, MAX_LEVEL),
            maxLevel: clamp(Number(maxes[index]?.value), MIN_LEVEL, MAX_LEVEL),
            weight: clamp(Number(weights[index]?.value), 0, 1000),
        }))
    }

    private readRate(): number {
        return clamp(Number(this.findOne<HTMLInputElement>('.rate-input')?.value ?? this.rate), 0, 100)
    }

    private handleAddEntry(): void {
        const first = this.parsedDataset.species[0]

        if (first === undefined) {
            return
        }

        this.rate = this.readRate()
        this.entries = [...this.readEntries(), { speciesId: first.id, minLevel: 2, maxLevel: 5, weight: 10 }]
        this.patch()
    }

    private handleRemoveEntry(event: Event): void {
        const index = event.currentTarget instanceof HTMLElement ? Number(event.currentTarget.dataset.index) : NaN

        this.rate = this.readRate()
        this.entries = this.readEntries().filter((_entry, each) => each !== index)
        this.patch()
    }

    private handleSubmit(event: Event): void {
        event.preventDefault()

        const entries = this.readEntries().map(entry => ({ ...entry, minLevel: Math.min(entry.minLevel, entry.maxLevel), maxLevel: Math.max(entry.minLevel, entry.maxLevel) }))

        Events.emit('close-modal', this)
        Events.emit<EncounterTable>(ENCOUNTERS_SUBMIT, { rate: this.readRate(), entries })
    }
}

function clamp(value: number, min: number, max: number): number {
    const whole = Math.floor(Number.isFinite(value) ? value : min)

    return Math.min(max, Math.max(min, whole))
}
