import { DraggableHTMLElement, handleDragAndDrop } from 'Client/Component/Generic/handleDragAndDrop'
import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { WindowConfiguration } from 'Model/UserData'

export class WindowBox extends Component implements DraggableHTMLElement {
    isDragging = false
    offsetX = 0
    offsetY = 0
    private configuration!: WindowConfiguration

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
                display: block;
                top: 50%;
                left: 50%;
                cursor: default;
                z-index: 1001;
                resize: both;
                overflow: hidden;
                max-height: 90vh;
                max-width: 90vw;
            }

            .window-box {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
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
                width: 100%;
                height: 100%;
                overflow: scroll;
                box-sizing: border-box;
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

    protected async setup(): Promise<void> {
        this.configuration = this.parsedDataset.configuration
    }

    protected build(): HTMLElement {
        const container = Dom.div('window-box')
        const content = Dom.div('content')
        const slot = Dom.slot()

        container.addEventListener('mousedown', (e) => Events.emit('mouse-down-window-box', this))

        content.append(slot)

        container.append(
            this.buildHeader(),
            content,
        )

        return container
    }

    protected afterBuild(): void {
        if (!this.configuration.rect) {
            this.configuration.rect = {
                left: this.style.left,
                top: this.style.top,
                width: this.style.width,
                height: this.style.height,
            }
        }
        (new ResizeObserver(() => {
            this.configuration.rect!.width = this.style.width
            this.configuration.rect!.height = this.style.height
            Events.emit('window-update', this.configuration)
        })).observe(this)
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
            const rect = this.getBoundingClientRect()
            this.configuration.rect!.left = this.style.left
            this.configuration.rect!.top = this.style.top
            Events.emit('window-update', this.configuration)
        })

        close.addEventListener('click', (event) => {
            event.stopPropagation()
            Events.emit('window-destroyed', this.dataset.title)
            this.remove()
        }, true)

        options.append(close)

        element.append(
            title,
            options,
        )

        return element
    }
}
