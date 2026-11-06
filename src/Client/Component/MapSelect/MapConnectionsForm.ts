import { Component, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { Connections, Edge, EDGES } from 'domain/connection'
import { Id } from 'domain/id'

type MapOption = { readonly id: Id; readonly name: string }

const EDGE_LABELS: { readonly [E in Edge]: string } = {
    north: 'North',
    south: 'South',
    east: 'East',
    west: 'West',
}

/**
 * The four edges of one map, inside `BasicModal`: a neighbour (or none) and
 * a cell offset each. Emits `map-connections-submit` with `Connections`.
 * A neighbour that no longer exists is shown as an error until replaced.
 */
export class MapConnectionsForm extends Component<{ connections: Connections; maps: MapOption[] }> {
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
                width: 420px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .edge {
                display: grid;
                grid-template-columns: 60px 1fr 90px;
                gap: 8px;
                align-items: center;
            }

            .edge-label {
                font-weight: 600;
                color: #333;
                font-size: 14px;
            }

            select, input {
                padding: 8px 10px;
                font-size: 14px;
                border-radius: 8px;
                border: 1px solid #ccc;
            }

            .missing {
                border-color: #c0392b;
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
        const errors: string[] = []

        form.className = 'form-container'

        for (const edge of EDGES) {
            form.append(this.edgeRow(edge, errors))
        }

        form.append(
            Dom.span('Offset is in cells along the edge, added to this map\'s coordinate: north with offset 3 lines this map\'s x=0 up with the neighbour\'s x=3.', 'hint'),
            Dom.span(errors.join(' '), 'error'),
            Dom.button('Save connections', 'submit-button'),
        )

        return form
    }

    private edgeRow(edge: Edge, errors: string[]): HTMLElement {
        const row = Dom.div('edge')
        const select = document.createElement('select')
        const offset = document.createElement('input')
        const current = this.parsedDataset.connections[edge]
        const none = document.createElement('option')

        select.className = edge + '-map'
        none.value = ''
        none.textContent = '— none —'
        none.selected = current === undefined
        select.append(none)

        for (const map of this.parsedDataset.maps) {
            const option = document.createElement('option')

            option.value = map.id
            option.textContent = map.name
            option.selected = current?.mapId === map.id
            select.append(option)
        }

        if (current !== undefined && !this.parsedDataset.maps.some(map => map.id === current.mapId)) {
            select.classList.add('missing')
            errors.push(`${EDGE_LABELS[edge]} points at a map that no longer exists; pick another or none.`)
        }

        offset.type = 'number'
        offset.step = '1'
        offset.className = edge + '-offset'
        offset.value = String(current?.offset ?? 0)
        offset.title = 'Offset in cells'

        row.append(Dom.span(EDGE_LABELS[edge], 'edge-label'), select, offset)

        return row
    }

    private handleSubmit(event: Event): void {
        event.preventDefault()

        const connections: Connections = {}
        const error = this.findOne('.error')

        for (const edge of EDGES) {
            const select = this.findOne<HTMLSelectElement>(`.${edge}-map`)
            const offset = Number(this.findOne<HTMLInputElement>(`.${edge}-offset`)?.value)

            if (select === null || select.value === '') {
                continue
            }

            if (!Number.isInteger(offset)) {
                if (error) error.textContent = `${EDGE_LABELS[edge]}: the offset must be a whole number of cells.`
                return
            }

            connections[edge] = { mapId: select.value, offset }
        }

        Events.emit('close-modal', this)
        Events.emit('map-connections-submit', connections)
    }
}
