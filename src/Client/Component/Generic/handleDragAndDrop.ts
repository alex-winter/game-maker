export interface DraggableHTMLElement extends HTMLElement {
    isDragging: boolean
    offsetX: number
    offsetY: number
}

export function handleDragAndDrop(element: DraggableHTMLElement, event: MouseEvent): void {
    element.isDragging = true

    const rect = element.getBoundingClientRect()

    element.offsetX = event.clientX - rect.left
    element.offsetY = event.clientY - rect.top

    const onMouseMove = (e: MouseEvent) => {
        if (element.isDragging) {
            element.style.left = `${e.clientX - element.offsetX}px`
            element.style.top = `${e.clientY - element.offsetY}px`
        }
    }

    const onMouseUp = () => {
        element.isDragging = false
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
}