import { EVENTS } from 'Client/Constants/events'
import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { LayerRepository } from 'Client/Service/Repository/LayerRepository'
import { Layer } from 'Model/Layer'

export class LayerListing extends Component {

    private layers!: Layer[]

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

    protected async setup(): Promise<void> {
        this.layers = await LayerRepository.getAll()
    }

    protected build(): HTMLElement {
        const container = Dom.div()
        const listing = Dom.div()
        const addNewLayerButton = Dom.button('Add New Layer')

        addNewLayerButton.addEventListener('click', () => Events.emit(EVENTS.openAddNewLayer))

        listing.append(
            ...this.layers.map(this.buildLayer)
        )

        Events.listen(EVENTS.newLayerMapped, event => {
            listing.append(
                this.buildLayer(event.detail as Layer)
            )
        })

        container.append(listing, addNewLayerButton)

        return container
    }

    private buildLayer(layer: Layer): HTMLElement {
        const container = Dom.div('layer-item')
        const name = Dom.div()
        const options = Dom.div()
        const visibleButton = Dom.button('o')

        name.innerText = layer.name

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