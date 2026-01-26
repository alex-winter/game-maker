import { LayerItem } from 'Client/Component/LayerListing/LayerItem'
import { Component, ExternalListeners, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { layerRepository } from 'Client/Service/Repository/LayerRepository'
import { Layer } from 'Model/Layer'

export class LayerListing extends Component {
    protected externalListeners: ExternalListeners = {
        'layers-created': this.handleNewLayers,
    }

    protected listeners: Listeners = {
        '.add-new:click': this.handleClickAddNew,
        '.add-player:click': this.handleClickAddPlayer,
    }

    private layers!: Layer[]

    protected async setup(): Promise<void> {
        this.layers = await layerRepository.getAll()
    }

    protected build(): HTMLElement {
        const container = Dom.div('layer-listing-container')
        const listing = Dom.div('listing')
        const addNewLayerButton = Dom.button('+ Add New Layer', 'add-new')
        const addPlayerButton = Dom.button('Add Player', 'add-player')

        listing.append(
            ...this.layers.map(this.buildLayer.bind(this))
        )

        container.append(listing, addNewLayerButton, addPlayerButton)

        return container
    }

    private handleClickAddNew(): void {
        Events.emit(Events.openAddNewLayer, undefined)
    }

    private handleClickAddPlayer(): void {
        Events.emit(Events.openAddPlayer, undefined)
    }

    private handleNewLayers(): void {
        layerRepository.getAll().then(layers => {
            this.layers = layers
            this.patch()
        })
    }

    private buildLayer(layer: Layer): HTMLElement {
        return Dom.makeComponent(LayerItem, { layer })
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
            .add-player {
                align-self: center;
                padding: 10px 20px;
                font-size: 16px;
                background-color: #3498db;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: background-color 0.3s ease;
                margin-left: 8px;
            }

            .add-player:hover {
                background-color: #2c80bd;
            }
        `
    }
}
