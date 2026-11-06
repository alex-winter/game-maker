import { LayerItem } from 'Client/Component/LayerListing/LayerItem'
import { LayerInput } from 'Client/Model/LayerInput'
import { Component, ExternalListeners, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { MAP_SESSION_CHANGED, mapSession, PaintTarget } from 'Client/Service/map-session'
import { addTileLayer, MAX_ELEVATION, TileLayer } from 'domain/map'

type AttributeKind = 'collision' | 'elevation'

/**
 * The open map's tile layers, front-most first, then the two attribute grids
 * (collision, elevation) as paint targets with their own overlay toggles.
 * Edits go through `mapSession`.
 */
export class LayerListing extends Component {
    protected externalListeners: ExternalListeners = {
        [MAP_SESSION_CHANGED]: this.patch,
        'new-layer-submit': this.handleNewLayerSubmit,
    }

    protected listeners: Listeners = {
        '.add-new:click': this.handleClickAddNew,
        '.attribute:click': this.handleAttributeClick,
        '.attribute .visibility-button:click': this.handleAttributeVisibility,
        '.elevation-input:change': this.handleElevationChange,
        '.elevation-input:click': this.stopPropagation,
    }

    protected build(): HTMLElement {
        const container = Dom.div('layer-listing-container')
        const listing = Dom.div('listing')
        const addNewLayerButton = Dom.button('+ Add New Layer', 'add-new')
        const attributes = Dom.div('attributes')

        listing.append(
            ...[...mapSession.tileMap.layers].reverse().map(this.buildLayer.bind(this))
        )

        attributes.append(
            this.buildAttribute('collision', 'Collision', 'fa-road-barrier'),
            this.buildAttribute('elevation', 'Elevation', 'fa-stairs'),
        )

        container.append(listing, addNewLayerButton, attributes)

        return container
    }

    private buildLayer(layer: TileLayer): HTMLElement {
        return Dom.makeComponent(LayerItem, {
            layer,
            isActive: mapSession.isTarget({ kind: 'layer', layerId: layer.id }),
            isHidden: mapSession.isHidden(layer.id),
        })
    }

    private buildAttribute(kind: AttributeKind, label: string, icon: string): HTMLElement {
        const row = Dom.div('attribute', kind)
        const name = Dom.div('name')
        const options = Dom.div('options')
        const visibility = Dom.button('', 'visibility-button')
        const hidden = mapSession.isHidden(kind)

        row.dataset.kind = kind
        row.classList.toggle('active', mapSession.isTarget({ kind }))
        row.classList.toggle('hidden-layer', hidden)
        name.append(Dom.i('fa-solid', icon, 'kind-icon'), Dom.span(label, 'name-text'))
        visibility.title = hidden ? 'Show overlay' : 'Hide overlay'
        visibility.append(Dom.i('fa-solid', hidden ? 'fa-eye-slash' : 'fa-eye'))

        if (kind === 'elevation') {
            const input = document.createElement('input')

            input.type = 'number'
            input.min = '1'
            input.max = String(MAX_ELEVATION)
            input.value = String(mapSession.elevationBrush)
            input.className = 'elevation-input'
            input.title = 'Elevation the pencil writes'
            options.append(input)
        }

        options.append(visibility)
        row.append(name, options)

        return row
    }

    private targetOf(event: Event): PaintTarget | undefined {
        const row = event.currentTarget instanceof HTMLElement
            ? event.currentTarget.closest<HTMLElement>('.attribute')
            : null
        const kind = row?.dataset.kind

        return kind === 'collision' || kind === 'elevation' ? { kind } : undefined
    }

    private handleAttributeClick(event: Event): void {
        const target = this.targetOf(event)

        if (target) {
            mapSession.setTarget(target)
        }
    }

    private handleAttributeVisibility(event: Event): void {
        event.stopPropagation()

        const target = this.targetOf(event)

        if (target && target.kind !== 'layer') {
            mapSession.toggleHidden(target.kind)
        }
    }

    private handleElevationChange(event: Event): void {
        if (event.target instanceof HTMLInputElement) {
            mapSession.setElevationBrush(Number(event.target.value))
        }
    }

    private stopPropagation(event: Event): void {
        event.stopPropagation()
    }

    private handleClickAddNew(): void {
        Events.emit(Events.openAddNewLayer, undefined)
    }

    private handleNewLayerSubmit(input: LayerInput): void {
        const name = input.name.trim()

        if (name === '') {
            return
        }

        void mapSession.commit(addTileLayer(mapSession.tileMap, name, input.kind))
    }

    protected css(): string {
        return /*css*/`
            .layer-listing-container {
                padding: 16px;
                background: #f9f9f9;
                border-radius: 12px;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .listing, .attributes {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .attributes {
                border-top: 1px solid #e0e0e0;
                padding-top: 12px;
            }

            .attribute {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px 16px;
                border-radius: 10px;
                background: white;
                box-shadow: 0 1px 4px rgba(0,0,0,0.05);
                cursor: pointer;
                border: 2px solid white;
            }

            .attribute:hover {
                background: #f0f0f0;
            }

            .attribute.active {
                border-color: #3498db;
                background: #ecf6fd;
            }

            .attribute.collision {
                border-left: 4px solid #e74c3c;
            }

            .attribute.elevation {
                border-left: 4px solid #3498db;
            }

            .attribute.hidden-layer .name {
                opacity: 0.5;
            }

            .attribute .name {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 500;
                font-size: 15px;
            }

            .attribute .kind-icon {
                color: #888;
                font-size: 12px;
            }

            .attribute .options {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .attribute .options button {
                border: none;
                background: transparent;
                font-size: 16px;
                color: #555;
                cursor: pointer;
                padding: 4px;
            }

            .attribute .options i {
                pointer-events: none;
            }

            .elevation-input {
                width: 3.5em;
                padding: 2px 4px;
                font-size: 14px;
                border: 1px solid #ccc;
                border-radius: 4px;
            }

            .add-new {
                align-self: center;
                padding: 10px 20px;
                font-size: 16px;
                background-color: #2ecc71;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: background-color 0.3s ease;
            }

            .add-new:hover {
                background-color: #27ae60;
            }
        `
    }
}
