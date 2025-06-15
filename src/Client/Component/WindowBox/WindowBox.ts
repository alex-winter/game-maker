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
            transform: translate(-50%, -50%);
            z-index: 1001;
            resize: both;
            overflow: hidden;
            max-height: 90vh;
            max-width: 90vw;
            border-radius: 12px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
            background: white;
            transition: box-shadow 0.2s ease;
            font-family: 'Segoe UI', sans-serif;
        }

        :host(:hover) {
            box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
        }

        .window-box {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            border-radius: inherit;
        }

        .header {
            background: linear-gradient(135deg, #6c63ff, #5a52d6);
            color: white;
            padding: 10px 16px;
            cursor: move;
            user-select: none;
            display: flex;
            align-items: center;
            border-top-left-radius: 12px;
            border-top-right-radius: 12px;
        }

        .header > div {
            flex: 1;
            font-weight: 600;
            font-size: 1rem;
            letter-spacing: 0.5px;
        }

        .options {
            display: flex;
            justify-content: flex-end;
            align-items: center;
        }

        .close {
            font-size: 1.1rem;
            font-weight: bold;
            padding: 4px 10px;
            border-radius: 6px;
            transition: background 0.2s ease;
        }

        .close:hover {
            background: rgba(255, 255, 255, 0.2);
            color: #ff6b6b;
            cursor: pointer;
        }

        .content {
            padding: 14px;
            background: #fff;
            border-top: 1px solid #ddd;
            width: 100%;
            height: 100%;
            overflow: auto;
            box-sizing: border-box;
        }

        @keyframes flash {
            0% {
                box-shadow: 0 0 0 rgba(255, 200, 0, 0.8);
                transform: scale(1);
            }
            50% {
                box-shadow: 0 0 16px rgba(255, 200, 0, 0.9);
                transform: scale(1.02);
            }
            100% {
                box-shadow: 0 0 0 rgba(255, 200, 0, 0);
                transform: scale(1);
            }
        }

        :host(.flash) {
            animation: flash 0.4s ease-in-out;
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
