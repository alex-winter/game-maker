import { LoadedPlacement } from 'Client/Model/LoadedPlacement'
import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { layerRepository } from 'Client/Service/Repository/LayerRepository'
import { ImagePlacement, Placement } from 'Model/Placement'

class PlacementHistory extends Component {

    private placements!: LoadedPlacement[]

    // protected async setup(): Promise<void> {
    //     const layers = await layerRepository.getAll()

    //     layers.forEach(layer => {
    //         this.placements.push(...layer.placements)
    //     })
    // }

    protected build(): HTMLElement {
        //     const container = Dom.div()

        //     this.placements.forEach(placement => {
        //         container.append(this.buildPlacementRow(placement))
        //     })

        //     return container
        return Dom.div()
    }

    // private buildPlacementRow(placement: ImagePlacement): HTMLElement {
    //     const container = Dom.div()

    //     placement

    //     return container
    // }
}