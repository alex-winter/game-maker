import { LayerItem } from 'Client/Component/LayerListing/LayerItem'
import { Component, ExternalListeners, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { layerRepository } from 'Client/Service/Repository/LayerRepository'
import { Layer } from 'Model/Layer'

export class LayerListing extends Component {
    protected externalListeners: ExternalListeners = {
        'new-layer-mapped': this.handleNewLayers,
        'layer-update': this.handleLayerUpdate,
    }

    protected listeners: Listeners = {
        '.add-new:click': this.handleClickAddNew
    }

    private layers!: Layer[]

    private handleLayerUpdate() {
        this.patch()
    }

    protected async setup(): Promise<void> {
        this.layers = await layerRepository.getAll()
    }

    protected build(): HTMLElement {
        const container = Dom.div()
        const listing = Dom.div('listing')
        const addNewLayerButton = Dom.button('Add New Layer', 'add-new')

        listing.append(
            ...this.layers.sort((a, b) => a.order - b.order).map(this.buildLayer.bind(this))
        )

        container.append(
            listing,
            addNewLayerButton,
        )

        return container
    }

    private handleClickAddNew(): void {
        Events.emit('open-add-new-layer')
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
}