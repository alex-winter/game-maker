import { LayerItem } from 'Client/Component/LayerListing/LayerItem'
import { EVENTS } from 'Client/Constants/events'
import { Component, ExternalListeners, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { Layer } from 'Model/Layer'

export class LayerListing extends Component {

    protected externalListerners: ExternalListeners = {
        'new-layer-mapped': this.handleNewLayers,
    }

    protected listeners: Listeners = {
        '.add-new:click': this.handleClickAddNew
    }

    private layers!: Layer[]

    protected async setup(): Promise<void> {
        this.layers = this.parameters.layers
    }

    protected build(): HTMLElement {
        const container = Dom.div()
        const listing = Dom.div('listing')
        const addNewLayerButton = Dom.button('Add New Layer', 'add-new')

        container.append(
            listing,
            addNewLayerButton,
        )

        return container
    }

    protected afterBuild(): void {
        this.addLayers(this.layers)
    }

    private handleClickAddNew(): void {
        Events.emit(EVENTS.openAddNewLayer)
    }

    private handleNewLayers(event: CustomEvent): void {
        const layers = event.detail as Layer[]

        this.addLayers(layers)
    }

    private addLayers(layers: Layer[]): void {
        const listing = this.findOne('.listing') as HTMLDivElement

        listing.append(
            ...layers.map(this.buildLayer.bind(this))
        )
    }

    private buildLayer(layer: Layer): HTMLElement {
        return Dom.makeComponent(LayerItem, { layer })
    }
}