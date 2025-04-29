import { Component } from "Client/Service/Component";
import { Dom } from "Client/Service/Dom";

export class WindowBox extends Component {
    private isDragging = false;
    private offsetX = 0;
    private offsetY = 0;

    protected css(): string {
        return /*css*/`
            :host {
                position: fixed;
                top: 0;
                left: 0;
                cursor: default;
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
        const container = Dom.div()
        const content = Dom.div('content')
        const slot = document.createElement('slot')

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

        element.addEventListener('mousedown', (e: MouseEvent) => {
            this.isDragging = true

            const rect = this.getBoundingClientRect()

            this.offsetX = e.clientX - rect.left
            this.offsetY = e.clientY - rect.top

            const onMouseMove = (e: MouseEvent) => {
                if (this.isDragging) {
                    this.style.left = `${e.clientX - this.offsetX}px`
                    this.style.top = `${e.clientY - this.offsetY}px`
                }
            }

            const onMouseUp = () => {
                this.isDragging = false
                document.removeEventListener('mousemove', onMouseMove)
                document.removeEventListener('mouseup', onMouseUp)
            }

            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)
        })

        return element
    }
}
