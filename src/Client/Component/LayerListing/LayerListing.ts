import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
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