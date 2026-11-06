import { LEFT_BUTTON } from 'Client/Constants/mouse-events'
import { Component, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { extractImageFromCanvasArea } from 'Client/Service/extract-image-from-canvas-area'
import { projectRepository } from 'Client/Service/Repository/ProjectRepository'
import { GRID_SIZE, snap } from 'domain/grid'
import { Id } from 'domain/id'
import { sliceSheet } from 'domain/tileset'

export class SheetViewer extends Component<{ sheetId: Id; sheetName: string; imageSrc: string }> {
    private image: HTMLImageElement | null = null
    private canvas!: HTMLCanvasElement

    protected listeners: Listeners = {
        '.use-as-tileset:click': this.handleUseAsTileset,
    }

    protected css(): string {
        return /*css*/`
            :host {
                position: relative;
                display: block;
            }

            .selector-box {
                position: absolute;
                border: 1px solid #0078D7;
                background-color: rgba(0, 120, 215, 0.2);
                pointer-events: none;
                display: none;
                z-index: 10;
            }

            .toolbar {
                display: flex;
                justify-content: flex-end;
                padding: 6px 0 0;
            }

            .use-as-tileset {
                padding: 6px 10px;
                border: none;
                border-radius: 6px;
                background: #2ecc71;
                color: white;
                cursor: pointer;
            }
        `
    }

    protected async setup(): Promise<void> {
        if (this.dataset.imageSrc) {
            this.image = await Dom.image(this.dataset.imageSrc as string)
        }
    }

    protected build(): HTMLElement {
        const element = Dom.div()
        this.canvas = Dom.canvas(
            element.offsetHeight,
            element.offsetWidth,
        )
        const context = this.canvas.getContext('2d')!
        const selectorBox = this.buildSelectorBox()

        if (this.image) {
            this.canvas.width = this.image.width
            this.canvas.height = this.image.height

            context.drawImage(this.image, 0, 0)
        }

        const picture = Dom.div('picture')
        const toolbar = Dom.div('toolbar')

        picture.style.position = 'relative'
        picture.append(this.canvas, selectorBox)
        toolbar.append(Dom.button('Use as tileset', 'use-as-tileset'))
        element.append(picture, toolbar)

        return element
    }

    /** Slices this sheet once into a tileset, or reuses the one already cut from it, then opens its palette. */
    private async handleUseAsTileset(event: Event): Promise<void> {
        event.stopPropagation()

        if (!this.image) {
            return
        }

        const { sheetId, sheetName } = this.parsedDataset
        const project = await projectRepository.load()
        const existing = project.tilesets.find(tileset => tileset.metatiles[0]?.sheetId === sheetId)
        const tileset = existing ?? await (async () => {
            const sliced = sliceSheet(sheetName, sheetId, this.image?.width ?? 0, this.image?.height ?? 0)

            return projectRepository.createTileset(sliced.name, sliced.metatiles)
        })()

        Events.emit('open-tileset-palette', tileset.id)
    }

    protected buildSelectorBox(): HTMLDivElement {
        const box = Dom.div('selector-box')

        let startX = 0
        let startY = 0
        let isDragging = false

        const snapToCell = snap(GRID_SIZE)

        const onMouseMove = (event: MouseEvent) => {
            if (!isDragging) return

            const rect = this.getBoundingClientRect()
            const currentX = event.clientX - rect.left + this.scrollLeft
            const currentY = event.clientY - rect.top + this.scrollTop

            // The selection spans the cells that contain both corners of the drag.
            const left = snapToCell(Math.min(currentX, startX))
            const top = snapToCell(Math.min(currentY, startY))
            const right = snapToCell(Math.max(currentX, startX)) + GRID_SIZE
            const bottom = snapToCell(Math.max(currentY, startY)) + GRID_SIZE

            box.style.display = 'block'
            box.style.left = left + 'px'
            box.style.top = top + 'px'
            box.style.width = (right - left) + 'px'
            box.style.height = (bottom - top) + 'px'
        }

        const onMouseUp = async (event: MouseEvent) => {
            if (event.button === LEFT_BUTTON) {
                isDragging = false
                document.removeEventListener('mousemove', onMouseMove)
                document.removeEventListener('mouseup', onMouseUp)

                const boxX = parseInt(box.style.left || '0', 10)
                const boxY = parseInt(box.style.top || '0', 10)
                const boxWidth = parseInt(box.style.width || '0', 10)
                const boxHeight = parseInt(box.style.height || '0', 10)

                Events.emit(
                    'sheet-selection-made',
                    await extractImageFromCanvasArea(
                        this.canvas,
                        boxX,
                        boxY,
                        boxWidth,
                        boxHeight
                    )
                )
            }
        }

        this.addEventListener('mousedown', (event: MouseEvent) => {
            // The host sees itself as the target; the real one is at the front of the composed path.
            const pressed = event.composedPath()[0]

            if (event.button === LEFT_BUTTON && !(pressed instanceof HTMLButtonElement)) {
                const rect = this.getBoundingClientRect()
                isDragging = true
                startX = event.clientX - rect.left + this.scrollLeft
                startY = event.clientY - rect.top + this.scrollTop

                box.style.display = 'none'

                document.addEventListener('mousemove', onMouseMove)
                document.addEventListener('mouseup', onMouseUp)
            }
        })

        return box
    }
}