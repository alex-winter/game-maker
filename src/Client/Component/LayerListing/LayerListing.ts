import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Layer } from 'Model/Layer'

export class LayerListing extends Component {
    public isSingleton(): boolean {
        return false
    }

    protected build(): HTMLElement {
        const container = Dom.div()

        this.data().then(layers => {
            container.append(
                ...layers.map(this.buildLayer)
            )
        })

        return container
    }

    private async data(): Promise<Layer[]> {
        const resposne = await fetch('/layers')
        const data = await resposne.json()

        return data
    }

    private buildLayer(layer: Layer): HTMLElement {
        const container = Dom.div('layer-item')

        container.innerText = layer.name

        return container
    }
}