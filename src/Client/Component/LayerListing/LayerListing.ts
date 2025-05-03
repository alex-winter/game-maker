import { EVENTS } from 'Client/Constants/events'
import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { Layer } from 'Model/Layer'

export class LayerListing extends Component {

    private layers!: Layer[]

    protected async setup(): Promise<void> {
        const resposne = await fetch('/layers')

        this.layers = await resposne.json()
    }

    protected build(): HTMLElement {
        const container = Dom.div()
        const addNewLayerButton = Dom.button('Add New Layer')

        addNewLayerButton.addEventListener('click', () => Events.emit(EVENTS.openAddNewLayer))

        container.append(
            ...this.layers.map(this.buildLayer)
        )

        container.append(addNewLayerButton)

        return container
    }

    private buildLayer(layer: Layer): HTMLElement {
        const container = Dom.div('layer-item')

        container.innerText = layer.name

        return container
    }
}