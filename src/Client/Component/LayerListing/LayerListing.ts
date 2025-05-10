import { LayerItem } from 'Client/Component/LayerListing/LayerItem'
import { EVENTS } from 'Client/Constants/events'
import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { Layer } from 'Model/Layer'

export class LayerListing extends Component {
    private listing!: HTMLDivElement
    private addNewLayerButton!: HTMLButtonElement

    protected build(): HTMLElement {
        const container = Dom.div()
        this.listing = Dom.div()
        this.addNewLayerButton = Dom.button('Add New Layer')

        container.append(this.listing, this.addNewLayerButton)

        return container
    }

    protected afterBuild(): void {
        this.addNewLayerButton.addEventListener('click', () => Events.emit(EVENTS.openAddNewLayer))

        Events.listen(
            event => {
                this.listing.append(
                    ...(event.detail as Layer[]).map(this.buildLayer.bind(this))
                )
            },
            EVENTS.newLayerMapped,
            EVENTS.gotLayer,
        )
    }

    private buildLayer(layer: Layer): HTMLElement {
        return Dom.makeComponent(LayerItem, { layer })
    }
}