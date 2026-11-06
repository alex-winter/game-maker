import { LEFT_BUTTON } from 'Client/Constants/mouse-events'
import { Component, ExternalListeners, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Brush, brush, BRUSH_CHANGED } from 'Client/Service/brush'
import { projectRepository } from 'Client/Service/Repository/ProjectRepository'
import { sheetRepository } from 'Client/Service/Repository/SheetRepository'
import { Id } from 'domain/id'
import { Metatile, metatileById, MetatileId, Tileset } from 'domain/tileset'

/**
 * Shows a tileset's sheet with its 16×16 slices. Clicking a slice makes
 * that metatile the brush. The selected metatile can be marked solid.
 */
export class TilesetPalette extends Component<{ tilesetId: Id }> {
    private tileset!: Tileset
    private sheet: HTMLImageElement | undefined
    private selected: MetatileId | undefined

    protected externalListeners: ExternalListeners = {
        [BRUSH_CHANGED]: this.handleBrushChanged,
    }

    protected listeners: Listeners = {
        'canvas:mousedown': this.handleCanvasMouseDown,
        '.solid-toggle:change': this.handleSolidToggle,
    }

    protected css(): string {
        return /*css*/`
            :host {
                display: block;
                font-family: 'Segoe UI', sans-serif;
                font-size: 13px;
            }

            .sheet {
                position: relative;
                overflow: auto;
                max-width: 70vw;
                max-height: 60vh;
            }

            canvas {
                display: block;
                image-rendering: pixelated;
                cursor: crosshair;
            }

            .attributes {
                display: flex;
                gap: 12px;
                align-items: center;
                padding: 8px 4px 0;
            }

            .readout {
                color: #555;
            }
        `
    }

    protected async setup(): Promise<void> {
        const tileset = projectRepository.cachedTileset(this.parsedDataset.tilesetId)

        if (tileset === undefined) {
            throw new Error('Unknown tileset ' + this.parsedDataset.tilesetId)
        }

        this.tileset = tileset

        const sheetId = tileset.metatiles[0]?.sheetId
        const sheet = sheetId === undefined
            ? undefined
            : (await sheetRepository.getAll()).find(candidate => candidate.id === sheetId)

        this.sheet = sheet === undefined ? undefined : await Dom.image(sheet.imageSrc)

        const current = brush.get()

        if (current !== undefined && current.tilesetId === tileset.id) {
            this.selected = current.metatileId
        }
    }

    protected build(): HTMLElement {
        const container = Dom.div('palette')
        const sheetBox = Dom.div('sheet')
        const canvas = Dom.canvas(this.sheet?.width ?? 0, this.sheet?.height ?? 0)

        sheetBox.append(canvas)
        container.append(sheetBox, this.buildAttributes())

        this.paint(canvas)

        return container
    }

    private buildAttributes(): HTMLElement {
        const row = Dom.div('attributes')
        const selected = this.selectedMetatile()
        const readout = Dom.span(
            selected === undefined ? 'No metatile selected' : `Metatile ${selected.id}`,
            'readout',
        )
        const label = Dom.label('Solid', 'solid-label')
        const toggle = document.createElement('input')

        toggle.type = 'checkbox'
        toggle.className = 'solid-toggle'
        toggle.checked = selected?.solid ?? false
        toggle.disabled = selected === undefined

        label.prepend(toggle)
        row.append(readout, label)

        return row
    }

    private selectedMetatile(): Metatile | undefined {
        return this.selected === undefined ? undefined : metatileById(this.tileset, this.selected)
    }

    private paint(canvas: HTMLCanvasElement): void {
        const ctx = canvas.getContext('2d')

        if (!ctx || !this.sheet) {
            return
        }

        ctx.imageSmoothingEnabled = false
        ctx.drawImage(this.sheet, 0, 0)

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)'
        ctx.lineWidth = 1

        for (const metatile of this.tileset.metatiles) {
            ctx.strokeRect(metatile.x + 0.5, metatile.y + 0.5, metatile.w - 1, metatile.h - 1)

            if (metatile.solid) {
                ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'
                ctx.fillRect(metatile.x, metatile.y, metatile.w, metatile.h)
            }
        }

        const selected = this.selectedMetatile()

        if (selected !== undefined) {
            ctx.strokeStyle = '#0078D7'
            ctx.lineWidth = 2
            ctx.strokeRect(selected.x + 1, selected.y + 1, selected.w - 2, selected.h - 2)
        }
    }

    /** The metatile whose rectangle contains a point on the sheet. */
    private metatileAtPoint(x: number, y: number): Metatile | undefined {
        return this.tileset.metatiles.find(metatile =>
            x >= metatile.x && x < metatile.x + metatile.w && y >= metatile.y && y < metatile.y + metatile.h)
    }

    private handleCanvasMouseDown(event: MouseEvent): void {
        if (event.button !== LEFT_BUTTON || !(event.currentTarget instanceof HTMLCanvasElement)) {
            return
        }

        const rect = event.currentTarget.getBoundingClientRect()
        const metatile = this.metatileAtPoint(event.clientX - rect.left, event.clientY - rect.top)

        if (metatile === undefined) {
            return
        }

        brush.set({ tilesetId: this.tileset.id, metatileId: metatile.id })
    }

    private handleBrushChanged(next: Brush | undefined): void {
        this.selected = next !== undefined && next.tilesetId === this.tileset.id ? next.metatileId : undefined
        this.patch()
    }

    private async handleSolidToggle(event: Event): Promise<void> {
        const selected = this.selectedMetatile()

        if (selected === undefined || !(event.target instanceof HTMLInputElement)) {
            return
        }

        await projectRepository.setMetatileAttributes(this.tileset.id, selected.id, { solid: event.target.checked })

        const tileset = projectRepository.cachedTileset(this.tileset.id)

        if (tileset !== undefined) {
            this.tileset = tileset
        }

        this.patch()
    }
}
