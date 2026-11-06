import { Component, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { GridSize, isValidGridSize, MAX_MAP_SIDE } from 'domain/map'

/** Width and height in cells, inside `BasicModal`. Emits `map-size-submit` with a valid `GridSize`. */
export class MapSizeForm extends Component<{ width: number; height: number }> {
    protected listeners: Listeners = {
        '.submit-button:click': this.handleSubmit,
        'form:submit': this.handleSubmit,
    }

    protected css(): string {
        return /*css*/`
            .form-container {
                font-family: 'Segoe UI', sans-serif;
                background: #fff;
                padding: 24px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                width: 320px;
                display: flex;
                flex-direction: column;
                gap: 16px;
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
                font-size: 14px;
            }

            input {
                padding: 10px 12px;
                font-size: 14px;
                border-radius: 8px;
                border: 1px solid #ccc;
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

    protected build(): HTMLElement {
        const form = document.createElement('form')
        const row = Dom.div('row')

        form.className = 'form-container'
        row.append(
            this.numberField('Width', 'width', this.parsedDataset.width),
            this.numberField('Height', 'height', this.parsedDataset.height),
        )

        form.append(
            row,
            Dom.span(`Cells, 1 to ${MAX_MAP_SIDE}. Shrinking drops cells past the new edge; growing adds empty ones.`, 'hint'),
            Dom.span('', 'error'),
            Dom.button('Resize', 'submit-button'),
        )

        return form
    }

    private numberField(label: string, name: string, value: number): HTMLElement {
        const group = Dom.div('form-group')
        const input = document.createElement('input')

        input.type = 'number'
        input.name = name
        input.min = '1'
        input.max = String(MAX_MAP_SIDE)
        input.value = String(value)
        input.className = name + '-input'

        group.append(Dom.label(label, 'form-label'), input)

        return group
    }

    private handleSubmit(event: Event): void {
        event.preventDefault()

        const width = this.findOne<HTMLInputElement>('.width-input')
        const height = this.findOne<HTMLInputElement>('.height-input')
        const size: unknown = { width: Number(width?.value), height: Number(height?.value) }
        const error = this.findOne('.error')

        if (!isValidGridSize(size)) {
            if (error) error.textContent = `Enter whole numbers from 1 to ${MAX_MAP_SIDE}.`
            return
        }

        const valid: GridSize = size

        Events.emit('close-modal', this)
        Events.emit('map-size-submit', valid)
    }
}
