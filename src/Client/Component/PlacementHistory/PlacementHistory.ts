import { LoadedPlacement } from 'Client/Model/LoadedPlacement'
import { Component, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { loadedPlacementRepository } from 'Client/Service/Repository/LoadedPlacement'

export class PlacementHistory extends Component {

    protected listeners: Listeners = {
        'loaded-placement-added': this.handleLoadedPlacementAdded
    }

    protected build(): HTMLElement {
        const container = Dom.div('placement-history')

        const header = Dom.div('placement-history-header')
        header.append(
            Dom.div('column', 'coords-col', 'header-cell').appendChild(document.createTextNode('Coordinates')),
            Dom.div('column', 'dims-col', 'header-cell').appendChild(document.createTextNode('Dimensions')),
            Dom.div('column', 'image-col', 'header-cell').appendChild(document.createTextNode('Image'))
        )
        container.appendChild(header)

        loadedPlacementRepository.get().forEach(placement => {
            container.append(
                this.buildPlacementRow(placement)
            )
        })

        return container
    }

    private handleLoadedPlacementAdded(): void {
        this.patch()
    }

    private buildPlacementRow(placement: LoadedPlacement): HTMLElement {
        const row = Dom.div('placement-row')

        const coordsCol = Dom.div('column', 'coords-col')
        coordsCol.textContent = `(${placement.x}, ${placement.y})`

        const dimsCol = Dom.div('column', 'dims-col')
        dimsCol.textContent = `${placement.width}×${placement.height}`

        const imageCol = Dom.div('column', 'image-col')
        const thumbnail = placement.image.cloneNode(true) as HTMLImageElement
        thumbnail.classList.add('placement-thumb')
        imageCol.appendChild(thumbnail)

        row.append(
            coordsCol,
            dimsCol,
            imageCol,
        )

        return row
    }

    protected css(): string {
        return /*css*/`
            .placement-history {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                font-family: sans-serif;
                padding: 1rem;
                background: #fafafa;
                border: 1px solid #ccc;
                border-radius: 8px;
            }

            .placement-history-header,
            .placement-row {
                display: flex;
                align-items: center;
                padding: 0.5rem;
                border-bottom: 1px solid #e0e0e0;
            }

            .placement-history-header {
                font-weight: bold;
                background: #f0f0f0;
                border-radius: 4px;
            }

            .column {
                flex: 1;
                padding: 0 0.5rem;
            }

            .uuid-col {
                flex: 2;
            }

            .coords-col,
            .dims-col {
                flex: 1.5;
            }

            .image-col {
                flex: 2;
                display: flex;
                align-items: center;
            }

            .placement-thumb {
                max-width: 60px;
                max-height: 40px;
                object-fit: contain;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
        `
    }
}
