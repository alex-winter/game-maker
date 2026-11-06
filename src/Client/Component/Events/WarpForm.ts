import { Component, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { Cell } from 'domain/coordinates'
import { Id } from 'domain/id'
import { GridSize, isInside } from 'domain/map'
import { Direction, isDirection } from 'domain/movement'
import { Warp } from 'domain/warp'

type MapOption = { readonly id: Id; readonly name: string; readonly size: GridSize }

export type WarpFormDataset = {
    /** The warp being edited, or null to create one on `cell`. */
    warp: Warp | null

    cell: Cell

    maps: MapOption[]
}

export const WARP_SUBMIT = 'warp-submit'

export const WARP_DELETE = 'warp-delete'

const FACINGS: readonly Direction[] = ['down', 'up', 'left', 'right']

/**
 * One warp, inside `BasicModal`: destination map, destination cell, and
 * arrival facing. Emits `warp-submit` with the warp's fields (id-less for
 * a new one) or `warp-delete` with the warp id.
 */
export class WarpForm extends Component<WarpFormDataset> {
    protected listeners: Listeners = {
        '.submit-button:click': this.handleSubmit,
        'form:submit': this.handleSubmit,
        '.delete-button:click': this.handleDelete,
        '.map-select:change': this.handleMapChange,
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
        const { warp, cell, maps } = this.parsedDataset
        const title = document.createElement('h3')
        const mapSelect = document.createElement('select')
        const facingSelect = document.createElement('select')
        const destination = maps.find(map => map.id === warp?.toMapId) ?? maps[0]

        form.className = 'form-container'
        title.textContent = `${warp === null ? 'New warp' : 'Warp'} at ${cell.x}, ${cell.y}`

        mapSelect.className = 'map-select'

        for (const map of maps) {
            const option = document.createElement('option')

            option.value = map.id
            option.textContent = map.name
            option.selected = map.id === destination?.id
            mapSelect.append(option)
        }

        facingSelect.className = 'facing-select'

        for (const facing of FACINGS) {
            const option = document.createElement('option')

            option.value = facing
            option.textContent = facing
            option.selected = facing === (warp?.facing ?? 'down')
            facingSelect.append(option)
        }

        const toX = this.numberInput('to-x', warp?.toCell.x ?? 0)
        const toY = this.numberInput('to-y', warp?.toCell.y ?? 0)
        const cellRow = Dom.div('row')

        cellRow.append(this.group('Arrive at X', toX), this.group('Arrive at Y', toY), this.group('Facing', facingSelect))

        const buttons = Dom.div('buttons')

        buttons.append(Dom.button(warp === null ? 'Place warp' : 'Save warp', 'submit-button'))

        if (warp !== null) {
            buttons.append(Dom.button('Delete', 'delete-button'))
        }

        form.append(
            title,
            this.group('Destination map', mapSelect),
            cellRow,
            Dom.span(this.sizeHint(destination), 'hint'),
            Dom.span('', 'error'),
            buttons,
        )

        return form
    }

    private group(label: string, control: HTMLElement): HTMLElement {
        const group = Dom.div('form-group')

        group.append(Dom.label(label, 'form-label'), control)

        return group
    }

    private numberInput(className: string, value: number): HTMLInputElement {
        const input = document.createElement('input')

        input.type = 'number'
        input.min = '0'
        input.step = '1'
        input.className = className
        input.value = String(value)

        return input
    }

    private sizeHint(map: MapOption | undefined): string {
        return map === undefined
            ? 'This project has no other maps to warp to.'
            : `${map.name} is ${map.size.width} × ${map.size.height} cells (0-based).`
    }

    private selectedMap(): MapOption | undefined {
        const id = this.findOne<HTMLSelectElement>('.map-select')?.value

        return this.parsedDataset.maps.find(map => map.id === id)
    }

    private handleMapChange(): void {
        const hint = this.findOne('.hint')

        if (hint) {
            hint.textContent = this.sizeHint(this.selectedMap())
        }
    }

    private handleSubmit(event: Event): void {
        event.preventDefault()

        const error = this.findOne('.error')
        const map = this.selectedMap()
        const facing = this.findOne<HTMLSelectElement>('.facing-select')?.value
        const toCell: Cell = {
            x: Number(this.findOne<HTMLInputElement>('.to-x')?.value),
            y: Number(this.findOne<HTMLInputElement>('.to-y')?.value),
        }

        if (map === undefined || !isDirection(facing)) {
            if (error) error.textContent = 'Pick a destination map and a facing.'
            return
        }

        if (!Number.isInteger(toCell.x) || !Number.isInteger(toCell.y) || !isInside(map.size, toCell)) {
            if (error) error.textContent = `The arrival cell must be inside ${map.name} (${map.size.width} × ${map.size.height}).`
            return
        }

        Events.emit('close-modal', this)
        Events.emit<Omit<Warp, 'id'> & { id: Id | null }>(WARP_SUBMIT, {
            kind: 'warp',
            id: this.parsedDataset.warp?.id ?? null,
            cell: this.parsedDataset.cell,
            toMapId: map.id,
            toCell,
            facing,
        })
    }

    private handleDelete(event: Event): void {
        event.preventDefault()

        const warp = this.parsedDataset.warp

        if (warp === null) {
            return
        }

        Events.emit('close-modal', this)
        Events.emit(WARP_DELETE, warp.id)
    }
}
