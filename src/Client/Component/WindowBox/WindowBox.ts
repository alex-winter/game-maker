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

    public flash(): void {
        this.classList.add('flash')
        setTimeout(() => {
            this.classList.remove('flash')
        }, 500)
    }

    protected css(): string {
        return /*css*/`
            :host {
                position: fixed;
                display: flex;
                flex-direction:column;
                top: 50%;
                left: 50%;
                transform: translateX(-50%) translateY(-50%);
                cursor: default;
                z-index: 1001;
                resize: both;
                overflow: auto;
                max-height: 90vh;
                max-width: 90vw;
            }

            .header {
                background: #ccc;
                padding: 10px;
                cursor: move;
                user-select: none;
                display: flex;
            }

            .header > div {
                flex: 1;
            }

            .options {
                display:flex;
                justify-content: flex-end;
            }

            .close:hover {
                color: red;
                cursor: pointer;
            }

            .content {
                padding: 10px;
                background: white;
                border: 1px solid #ccc;
                flex-grow: 1;
                width: 100%;
                height: 100%;
            }

            @keyframes flash {
                0% {
                  box-shadow: 0 0 0px rgba(255, 200, 0, 0.8);
                  transform: scale(1);
                }
                50% {
                  box-shadow: 0 0 12px rgba(255, 200, 0, 0.9);
                  transform: scale(1.02);
                }
                100% {
                  box-shadow: 0 0 0px rgba(255, 200, 0, 0);
                  transform: scale(1);
                }
              }
              
              :host(.flash) {
                animation: flash 0.5s ease-in-out;
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
        const title = Dom.div()
        const options = Dom.div('options')
        const close = Dom.div('close')

        close.innerText = 'x'

        title.innerText = this.dataset.title || ''

        element.addEventListener('mousedown', (e) => handleDragAndDrop(this, e))

        element.addEventListener('mouseup', (e) => {

        })

        close.addEventListener('click', (event) => {
            event.stopPropagation()
            this.destroy()
        }, true)

        options.append(close)

        element.append(
            title,
            options,
        )

        return element
    }
}
