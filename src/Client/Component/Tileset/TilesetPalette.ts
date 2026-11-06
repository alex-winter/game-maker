import { LEFT_BUTTON } from 'Client/Constants/mouse-events'
import { Component, ExternalListeners, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Brush, brush, BRUSH_CHANGED } from 'Client/Service/brush'
import { projectRepository } from 'Client/Service/Repository/ProjectRepository'
import { sheetRepository } from 'Client/Service/Repository/SheetRepository'
import { Id } from 'domain/id'
import { frameAt, frameCount, Metatile, MetatileAttributes, metatileById, MetatileId, Tileset, withAddedFrame } from 'domain/tileset'

/**
 * Shows a tileset's sheet with its 16×16 slices. Clicking a slice makes
 * that metatile the brush. The selected metatile can be marked solid and
 * given animation frames (T-045): press "+ Frame", then click the slice
 * that is the next picture; a small preview cycles them at the frame rate.
 */
export class TilesetPalette extends Component<{ tilesetId: Id }> {
    private tileset!: Tileset
    private sheet: HTMLImageElement | undefined
    private selected: MetatileId | undefined
    /** True while the next click on the sheet adds a frame instead of picking a brush. */
    private addingFrame = false
    private previewTimer: number | undefined

    protected externalListeners: ExternalListeners = {
        [BRUSH_CHANGED]: this.handleBrushChanged,
    }

    protected listeners: Listeners = {
        'canvas.sheet-canvas:mousedown': this.handleCanvasMouseDown,
        '.solid-toggle:change': this.handleSolidToggle,
        '.add-frame:click': this.handleAddFrame,
        '.clear-frames:click': this.handleClearFrames,
        '.frame-ms:change': this.handleFrameMs,
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

            .sheet.adding canvas {
                cursor: copy;
                outline: 2px dashed #0078D7;
            }

            .animation {
                display: flex;
                gap: 10px;
                align-items: center;
                padding: 8px 4px 0;
            }

            .preview {
                width: 32px;
                height: 32px;
                border: 1px solid #ccc;
                background: #eee;
                cursor: default;
            }

            .frame-ms {
                width: 64px;
            }

            .add-frame, .clear-frames {
                padding: 4px 8px;
                cursor: pointer;
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

        canvas.className = 'sheet-canvas'
        sheetBox.classList.toggle('adding', this.addingFrame)
        sheetBox.append(canvas)
        container.append(sheetBox, this.buildAttributes(), this.buildAnimation())

        this.paint(canvas)

        return container
    }

    protected afterBuild(): void {
        this.startPreview()
    }

    protected disconnectedCallback(): void {
        super.disconnectedCallback()
        this.stopPreview()
    }

    private buildAnimation(): HTMLElement {
        const row = Dom.div('animation')
        const selected = this.selectedMetatile()
        const preview = Dom.canvas(32, 32)
        const frames = Dom.span(selected === undefined ? '' : `${frameCount(selected)} frame${frameCount(selected) === 1 ? '' : 's'}`, 'frames-readout')
        const add = Dom.button(this.addingFrame ? 'Click the next frame…' : '+ Frame', 'add-frame')
        const clear = Dom.button('Clear frames', 'clear-frames')
        const rate = document.createElement('input')
        const rateLabel = Dom.label('ms per frame', 'rate-label')

        preview.className = 'preview'
        add.disabled = selected === undefined
        clear.disabled = selected?.animation === undefined
        rate.type = 'number'
        rate.className = 'frame-ms'
        rate.min = '16'
        rate.step = '1'
        rate.value = String(selected?.animation?.frameMs ?? '')
        rate.disabled = selected?.animation === undefined
        rateLabel.prepend(rate)

        row.append(preview, frames, add, clear, rateLabel)

        return row
    }

    private startPreview(): void {
        this.stopPreview()
        this.previewTimer = window.setInterval(() => this.paintPreview(), 50)
        this.paintPreview()
    }

    private stopPreview(): void {
        if (this.previewTimer !== undefined) {
            window.clearInterval(this.previewTimer)
            this.previewTimer = undefined
        }
    }

    /** The selected metatile as play would show it right now. */
    private paintPreview(): void {
        const canvas = this.findOne<HTMLCanvasElement>('canvas.preview')
        const ctx = canvas?.getContext('2d')
        const selected = this.selectedMetatile()

        if (!canvas || !ctx) {
            return
        }

        ctx.imageSmoothingEnabled = false
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (selected === undefined || this.sheet === undefined) {
            return
        }

        const source = frameAt(selected, performance.now())

        ctx.drawImage(this.sheet, source.x, source.y, source.width, source.height, 0, 0, canvas.width, canvas.height)
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

            // Later frames of the selected tile, numbered so the author sees the order.
            ctx.font = '10px sans-serif'
            ctx.textBaseline = 'top'

            for (const [index, frame] of (selected.animation?.frames ?? []).entries()) {
                ctx.strokeStyle = '#2e7d32'
                ctx.strokeRect(frame.x + 1, frame.y + 1, selected.w - 2, selected.h - 2)
                ctx.fillStyle = '#2e7d32'
                ctx.fillText(String(index + 1), frame.x + 3, frame.y + 2)
            }
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

        if (this.addingFrame) {
            this.addingFrame = false
            void this.addFrame(metatile)
            return
        }

        brush.set({ tilesetId: this.tileset.id, metatileId: metatile.id })
    }

    /** The clicked slice becomes the selected tile's next frame. */
    private async addFrame(frame: Metatile): Promise<void> {
        const selected = this.selectedMetatile()

        if (selected === undefined) {
            return
        }

        await this.setAttributes({ animation: withAddedFrame(selected, { x: frame.x, y: frame.y }) })
    }

    private handleAddFrame(): void {
        this.addingFrame = !this.addingFrame
        this.patch()
    }

    private async handleClearFrames(): Promise<void> {
        if (this.selectedMetatile() !== undefined) {
            await this.setAttributes({ animation: null })
        }
    }

    private async handleFrameMs(event: Event): Promise<void> {
        const selected = this.selectedMetatile()
        const frameMs = event.target instanceof HTMLInputElement ? Math.floor(Number(event.target.value)) : NaN

        if (selected?.animation === undefined || !Number.isInteger(frameMs) || frameMs <= 0) {
            return
        }

        await this.setAttributes({ animation: { ...selected.animation, frameMs } })
    }

    private async setAttributes(attributes: Partial<MetatileAttributes>): Promise<void> {
        const selected = this.selectedMetatile()

        if (selected === undefined) {
            return
        }

        await projectRepository.setMetatileAttributes(this.tileset.id, selected.id, attributes)

        const tileset = projectRepository.cachedTileset(this.tileset.id)

        if (tileset !== undefined) {
            this.tileset = tileset
        }

        this.patch()
    }

    private handleBrushChanged(next: Brush | undefined): void {
        this.selected = next !== undefined && next.tilesetId === this.tileset.id ? next.metatileId : undefined
        this.addingFrame = false
        this.patch()
    }

    private async handleSolidToggle(event: Event): Promise<void> {
        if (event.target instanceof HTMLInputElement) {
            await this.setAttributes({ solid: event.target.checked })
        }
    }
}
