import { LayerItem } from 'Client/Component/LayerListing/LayerItem'
import { LayerInput } from 'Client/Model/LayerInput'
import { Component, ExternalListeners, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { MAP_SESSION_CHANGED, mapSession } from 'Client/Service/map-session'
import { addTileLayer, TileLayer } from 'domain/map'

/** The open map's tile layers, front-most first. Edits go through `mapSession`. */
export class LayerListing extends Component {
    protected externalListeners: ExternalListeners = {
        [MAP_SESSION_CHANGED]: this.patch,
        'new-layer-submit': this.handleNewLayerSubmit,
    }

    protected listeners: Listeners = {
        '.add-new:click': this.handleClickAddNew,
    }

    protected build(): HTMLElement {
        const container = Dom.div('layer-listing-container')
        const listing = Dom.div('listing')
        const addNewLayerButton = Dom.button('+ Add New Layer', 'add-new')

        listing.append(
            ...[...mapSession.tileMap.layers].reverse().map(this.buildLayer.bind(this))
        )

        container.append(listing, addNewLayerButton)

        return container
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

    private buildLayer(layer: TileLayer): HTMLElement {
        // Grouped in one object: the dataset round-trip keeps objects, but a bare boolean would come back as text.
        return Dom.makeComponent(LayerItem, {
            layer,
            view: { isActive: mapSession.isActive(layer.id), isHidden: mapSession.isHidden(layer.id) },
        })
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

            .listing {
                display: flex;
                flex-direction: column;
                gap: 12px;
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
