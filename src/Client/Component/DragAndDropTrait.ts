import { Component } from 'Client/Service/Component'
import { HtmlElementTrait } from 'Client/Service/HtmlElementTrait'

export class DragAndDropTrait extends HtmlElementTrait {
    private isDragging = false
    private offsetX = 0
    private offsetY = 0

    public method(event: MouseEvent): void {
        this.isDragging = true

        const rect = this.getBoundingClientRect()

        this.offsetX = event.clientX - rect.left
        this.offsetY = event.clientY - rect.top

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
    }

    public static bind(that: Object): (e: MouseEvent) => void {
        return new DragAndDropTrait().method.bind(that)
    }
}