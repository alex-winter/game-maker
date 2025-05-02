import { DraggableHTMLElement, handleDragAndDrop } from 'Client/Component/Generic/handleDragAndDrop'
import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'

export class WindowBox extends Component implements DraggableHTMLElement {
    isDragging = false
    offsetX = 0
    offsetY = 0

    public zIndexMoveDown(): void {
        this.style.zIndex = '1000'
    }

    public zIndexMoveUp(): void {
        this.style.zIndex = '1001'
    }

    protected css(): string {
        return /*css*/`
            :host {
                position: fixed;
                top: 0;
                left: 0;
                cursor: default;
                z-index: 1001;
            }

            .header {
                background: #ccc;
                padding: 10px;
                cursor: move;
                user-select: none;
            }

            .content {
                padding: 10px;
                background: white;
                border: 1px solid #ccc;
            }
        `
    }

    protected build(): HTMLElement {
        const container = Dom.div('window-box')
        const content = Dom.div('content')
        const slot = Dom.slot()

        container.addEventListener('mousedown', (e) => Events.emitMouseDownOnWindowBox(this))

        content.append(slot)

        container.append(
            this.buildHeader(),
            content,
        )

        return container
    }

    private buildHeader(): HTMLElement {
        const element = Dom.div('header')

        element.innerText = this.dataset.title || ''

        element.addEventListener('mousedown', (e) => handleDragAndDrop(this, e))

        return element
    }
}
