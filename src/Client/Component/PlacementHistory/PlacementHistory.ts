import { LoadedPlacement } from 'Client/Model/LoadedPlacement'
import { Component, ExternalListeners, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { loadedPlacementRepository } from 'Client/Service/Repository/LoadedPlacement'

export class PlacementHistory extends Component {
    protected externalListeners: ExternalListeners = {
        'placement-added': this.handlePlacementAdded,
    }

    protected listeners: Listeners = {
        '.view-btn:click': this.handleViewClick,
        '.delete-btn:click': this.handleDeleteClick,
    }

    protected build(): HTMLElement {
        const container = Dom.div('placement-history')

        const header = Dom.div('placement-history-header')
        header.append(
            Dom.div('column', 'coords-col', 'header-cell').appendChild(document.createTextNode('Coordinates')),
            Dom.div('column', 'dims-col', 'header-cell').appendChild(document.createTextNode('Dimensions')),
            Dom.div('column', 'image-col', 'header-cell').appendChild(document.createTextNode('Image')),
            Dom.div('column', 'tools-col', 'header-cell').appendChild(document.createTextNode('Tools'))
        )
        container.appendChild(header)

        const loadedPlacements = loadedPlacementRepository.get()

        for (const loadedPlacement of loadedPlacements) {
            container.append(
                this.buildPlacementRow(loadedPlacement)
            )
        }

        return container
    }

    private handlePlacementAdded(): void {
        this.patch()
    }

    private buildPlacementRow(placement: LoadedPlacement): HTMLElement {
        const row = Dom.div('placement-row')
        row.dataset.uuid = placement.uuid

        const coordsCol = Dom.div('column', 'coords-col')
        coordsCol.textContent = `(${placement.x}, ${placement.y})`

        const dimsCol = Dom.div('column', 'dims-col')
        dimsCol.textContent = `${placement.width}×${placement.height}`

        const imageCol = Dom.div('column', 'image-col')
        const thumbnail = placement.image.cloneNode(true) as HTMLImageElement
        thumbnail.classList.add('placement-thumb')
        imageCol.appendChild(thumbnail)

        const toolsCol = Dom.div('column', 'tools-col')
        const viewBtn = Dom.button('', 'view-btn')
        const eyeIcon = Dom.i('fa', 'fa-eye')
        viewBtn.append(eyeIcon)

        const trashIcon = Dom.i('fa', 'fa-trash')
        const deleteBtn = Dom.button('', 'delete-btn')
        deleteBtn.append(trashIcon)
        toolsCol.append(viewBtn, deleteBtn)

        row.append(
            coordsCol,
            dimsCol,
            imageCol,
            toolsCol
        )

        return row
    }

    private handleViewClick(event: Event): void {
        event.stopPropagation()
        const row = (event.target as HTMLElement).closest('.placement-row') as HTMLElement
        const uuid = row?.dataset.uuid

        Events.emit('request-focus-on-placement', uuid)
    }

    private handleDeleteClick(event: Event): void {
        event.stopPropagation()
        const row = (event.target as HTMLElement).closest('.placement-row') as HTMLElement
        const uuid = row?.dataset.uuid

        // row.remove()

        Events.emit('request-placement-deletion', uuid)
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
                max-height: 400px;
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

            .tools-col {
                flex: 1;
                display: flex;
                justify-content: flex-end;
                gap: 0.5rem;
            }

            .placement-thumb {
                max-width: 60px;
                max-height: 40px;
                object-fit: contain;
                border: 1px solid #ddd;
                border-radius: 4px;
            }

            .tools-col button {
                background: none;
                border: none;
                cursor: pointer;
                font-size: 1rem;
                color: #555;
            }

            .tools-col button:hover {
                color: #000;
            }
        `
    }
}
