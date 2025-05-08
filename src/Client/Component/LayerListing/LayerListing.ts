import { EVENTS } from 'Client/Constants/events'
import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { Layer } from 'Model/Layer'

export class LayerListing extends Component {
    protected css(): string {
        return /*css*/`
            .layer-item {
                display: flex;
            }

            .layer-item > div {
                flex: 1;
            }
        `
    }

    protected build(): HTMLElement {
        const container = Dom.div()
        const listing = Dom.div()
        const addNewLayerButton = Dom.button('Add New Layer')

        addNewLayerButton.addEventListener('click', () => Events.emit(EVENTS.openAddNewLayer))

        Events.listen(
            event => {
                listing.append(
                    ...(event.detail as Layer[]).map(this.buildLayer.bind(this))
                )
            },
            EVENTS.newLayerMapped,
            EVENTS.gotLayer,
        )

        container.append(listing, addNewLayerButton)

        return container
    }

    private buildLayer(layer: Layer): HTMLElement {
        const container = Dom.div('layer-item')
        const name = Dom.div()
        const options = Dom.div()
        const visibleButton = Dom.button('o')

        name.innerText = layer.name

        container.addEventListener('click', () => Events.emit(EVENTS.layerActive, layer))

        options.append(
            visibleButton,
        )

        container.append(
            name,
            options,
        )

        return container
    }
}