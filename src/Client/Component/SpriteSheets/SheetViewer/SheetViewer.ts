import { Component, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { projectRepository } from 'Client/Service/Repository/ProjectRepository'
import { Id } from 'domain/id'
import { sliceSheet } from 'domain/tileset'

/** Shows one imported sheet. Since T-020 the only action is turning it into a tileset; the free-region stamp is gone. */
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
        const context = this.canvas.getContext('2d')

        if (this.image && context) {
            this.canvas.width = this.image.width
            this.canvas.height = this.image.height

            context.drawImage(this.image, 0, 0)
        }

        const picture = Dom.div('picture')
        const toolbar = Dom.div('toolbar')

        picture.style.position = 'relative'
        picture.append(this.canvas)
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
}
