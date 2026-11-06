import { LEFT_BUTTON } from 'Client/Constants/mouse-events'
import { Sheet } from 'Client/Model/Sheet'
import { Component, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { projectRepository } from 'Client/Service/Repository/ProjectRepository'
import { sheetRepository } from 'Client/Service/Repository/SheetRepository'
import { Rect } from 'domain/coordinates'
import { Id } from 'domain/id'
import { Direction } from 'domain/movement'
import {
    DEFAULT_FRAME_SIZE,
    DIRECTIONS,
    newSpriteDefinition,
    pickFrame,
    SpriteDefinition,
    withFrame,
    withoutWalkFrame,
} from 'domain/sprite'

type Slot = { readonly direction: Direction; readonly slot: 'idle' | number }

const DIRECTION_LABELS: { readonly [D in Direction]: string } = {
    down: 'Down',
    up: 'Up',
    left: 'Left',
    right: 'Right',
}

/** How fast the preview walks, in milliseconds per cycle. */
const PREVIEW_CYCLE_MS = 533

/**
 * Authors `SpriteDefinition`s: pick a sheet and frame size, select a slot
 * (a direction's idle pose or one of its walk frames), then click a frame on
 * the sheet to assign it. Every change saves. One sprite can be made the
 * player's.
 */
export class SpriteEditor extends Component<{ spriteId: Id | null }> {
    private sprites: SpriteDefinition[] = []
    private sheets: Sheet[] = []
    private sprite: SpriteDefinition | undefined
    private sheetImage: HTMLImageElement | undefined
    private selected: Slot = { direction: 'down', slot: 'idle' }
    private playerSpriteId: Id | null = null
    private previewTimer: number | undefined

    protected listeners: Listeners = {
        '.sprite-select:change': this.handleSpriteSelect,
        '.new-sprite:click': this.handleNewSprite,
        '.delete-sprite:click': this.handleDeleteSprite,
        '.rename-sprite:click': this.handleRenameSprite,
        '.sheet-select:change': this.handleSheetSelect,
        '.frame-width:change': this.handleFrameSize,
        '.frame-height:change': this.handleFrameSize,
        '.player-toggle:click': this.handlePlayerToggle,
        '.sheet-canvas:mousedown': this.handleSheetMouseDown,
        '.slot:click': this.handleSlotClick,
        '.remove-frame:click': this.handleRemoveFrame,
    }

    protected css(): string {
        return /*css*/`
            :host {
                display: block;
                font-family: 'Segoe UI', sans-serif;
                font-size: 13px;
                color: #333;
            }

            .toolbar {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                align-items: center;
                padding-bottom: 8px;
                border-bottom: 1px solid #ddd;
                margin-bottom: 8px;
            }

            .toolbar label {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .toolbar input[type=number] {
                width: 56px;
            }

            select, input, button {
                font: inherit;
            }

            button {
                padding: 4px 10px;
                border-radius: 6px;
                border: 1px solid #ccc;
                background: #fff;
                cursor: pointer;
            }

            button:hover {
                background: #f0f0f0;
            }

            .player-toggle.active {
                background: #4caf50;
                color: #fff;
                border-color: #4caf50;
            }

            .body {
                display: flex;
                gap: 16px;
            }

            .sheet {
                overflow: auto;
                max-width: 50vw;
                max-height: 60vh;
                background: #ccc;
                align-self: flex-start;
            }

            .sheet-canvas {
                display: block;
                image-rendering: pixelated;
                cursor: crosshair;
            }

            .frames {
                display: flex;
                flex-direction: column;
                gap: 8px;
                min-width: 260px;
            }

            .direction {
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .direction-label {
                width: 44px;
                font-weight: 600;
            }

            .slot {
                position: relative;
                border: 2px solid #ccc;
                border-radius: 4px;
                background: #e8e8e8;
                padding: 2px;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2px;
            }

            .slot.selected {
                border-color: #0078D7;
            }

            .slot canvas {
                image-rendering: pixelated;
                display: block;
            }

            .slot .caption {
                font-size: 10px;
                color: #666;
            }

            .slot.add {
                justify-content: center;
                min-width: 32px;
                min-height: 32px;
                color: #666;
                font-size: 18px;
            }

            .remove-frame {
                position: absolute;
                top: -8px;
                right: -8px;
                width: 16px;
                height: 16px;
                padding: 0;
                border-radius: 50%;
                font-size: 10px;
                line-height: 14px;
            }

            .preview {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-top: 8px;
                padding-top: 8px;
                border-top: 1px solid #ddd;
            }

            .preview canvas {
                image-rendering: pixelated;
                background: #e8e8e8;
            }

            .hint {
                color: #666;
            }

            .empty {
                color: #666;
                padding: 24px;
            }
        `
    }

    protected async setup(): Promise<void> {
        const project = await projectRepository.load()

        this.sprites = project.sprites
        this.playerSpriteId = project.playerSpriteId
        this.sheets = await sheetRepository.getAll()

        const requested = this.parsedDataset.spriteId

        this.sprite = this.sprites.find(sprite => sprite.id === requested) ?? this.sprites[0]

        await this.loadSheet()
    }

    protected afterBuild(): void {
        this.startPreview()
    }

    protected build(): HTMLElement {
        const container = Dom.div('sprite-editor')

        container.append(this.buildToolbar())

        if (this.sprite === undefined) {
            const empty = Dom.div('empty')

            empty.textContent = this.sheets.length === 0
                ? 'Import a sheet first, then create a sprite from it.'
                : 'No sprites yet. Use "+ Sprite" to create one.'
            container.append(empty)

            return container
        }

        const body = Dom.div('body')
        const sheetBox = Dom.div('sheet')
        const canvas = Dom.canvas(this.sheetImage?.width ?? 0, this.sheetImage?.height ?? 0)

        canvas.className = 'sheet-canvas'
        sheetBox.append(canvas)
        this.paintSheet(canvas)

        body.append(sheetBox, this.buildFrames(this.sprite))
        container.append(body, this.buildPreview())

        return container
    }

    private buildToolbar(): HTMLElement {
        const bar = Dom.div('toolbar')
        const spriteSelect = document.createElement('select')

        spriteSelect.className = 'sprite-select'

        for (const sprite of this.sprites) {
            const option = document.createElement('option')

            option.value = sprite.id
            option.textContent = sprite.name + (sprite.id === this.playerSpriteId ? ' (player)' : '')
            option.selected = sprite.id === this.sprite?.id
            spriteSelect.append(option)
        }

        if (this.sprites.length === 0) {
            const option = document.createElement('option')

            option.textContent = 'No sprites'
            spriteSelect.append(option)
            spriteSelect.disabled = true
        }

        const newButton = Dom.button('+ Sprite', 'new-sprite')

        newButton.disabled = this.sheets.length === 0
        bar.append(spriteSelect, newButton)

        if (this.sprite === undefined) {
            return bar
        }

        const sheetSelect = document.createElement('select')

        sheetSelect.className = 'sheet-select'

        for (const sheet of this.sheets) {
            const option = document.createElement('option')

            option.value = sheet.id
            option.textContent = sheet.name
            option.selected = sheet.id === this.sprite.sheetId
            sheetSelect.append(option)
        }

        const width = this.numberInput('frame-width', this.sprite.frameWidth)
        const height = this.numberInput('frame-height', this.sprite.frameHeight)
        const sizeLabel = Dom.label('Frame', 'frame-size')

        sizeLabel.append(width, Dom.span('×'), height)

        const playerToggle = Dom.button(
            this.sprite.id === this.playerSpriteId ? 'Player sprite' : 'Use as player',
            'player-toggle',
        )

        if (this.sprite.id === this.playerSpriteId) {
            playerToggle.classList.add('active')
        }

        bar.append(
            Dom.button('Rename', 'rename-sprite'),
            Dom.span('Sheet'),
            sheetSelect,
            sizeLabel,
            playerToggle,
            Dom.button('Delete', 'delete-sprite'),
        )

        return bar
    }

    private numberInput(className: string, value: number): HTMLInputElement {
        const input = document.createElement('input')

        input.type = 'number'
        input.className = className
        input.min = '1'
        input.max = '256'
        input.value = String(value)

        return input
    }

    private buildFrames(sprite: SpriteDefinition): HTMLElement {
        const frames = Dom.div('frames')
        const hint = Dom.span('Select a slot, then click a frame on the sheet.', 'hint')

        frames.append(hint)

        for (const direction of DIRECTIONS) {
            const row = Dom.div('direction')
            const label = Dom.span(DIRECTION_LABELS[direction], 'direction-label')
            const directionFrames = sprite.directions[direction]

            row.append(label, this.buildSlot(sprite, { direction, slot: 'idle' }, directionFrames.idle, 'idle'))

            directionFrames.walk.forEach((frame, index) => {
                row.append(this.buildSlot(sprite, { direction, slot: index }, frame, 'walk ' + (index + 1)))
            })

            const add = Dom.div('slot', 'add')

            add.dataset.direction = direction
            add.dataset.slot = String(directionFrames.walk.length)
            add.textContent = '+'
            add.title = 'Add a walk frame'
            row.append(add)
            frames.append(row)
        }

        return frames
    }

    private buildSlot(sprite: SpriteDefinition, slot: Slot, frame: Rect, caption: string): HTMLElement {
        const element = Dom.div('slot')
        const canvas = Dom.canvas(sprite.frameWidth * 2, sprite.frameHeight * 2)

        element.dataset.direction = slot.direction
        element.dataset.slot = String(slot.slot)

        if (this.isSelected(slot)) {
            element.classList.add('selected')
        }

        this.paintFrame(canvas, frame)
        element.append(canvas, Dom.span(caption, 'caption'))

        if (slot.slot !== 'idle') {
            const remove = Dom.button('×', 'remove-frame')

            remove.title = 'Remove this frame'
            remove.dataset.direction = slot.direction
            remove.dataset.slot = String(slot.slot)
            element.append(remove)
        }

        return element
    }

    private buildPreview(): HTMLElement {
        const preview = Dom.div('preview')
        const canvas = Dom.canvas((this.sprite?.frameWidth ?? 16) * 3, (this.sprite?.frameHeight ?? 32) * 3)

        canvas.className = 'preview-canvas'
        preview.append(Dom.span('Walking ' + DIRECTION_LABELS[this.selected.direction].toLowerCase(), 'hint'), canvas)

        return preview
    }

    private isSelected(slot: Slot): boolean {
        return this.selected.direction === slot.direction && this.selected.slot === slot.slot
    }

    private async loadSheet(): Promise<void> {
        const sheet = this.sprite === undefined ? undefined : this.sheets.find(candidate => candidate.id === this.sprite?.sheetId)

        this.sheetImage = sheet === undefined ? undefined : await Dom.image(sheet.imageSrc)
    }

    private paintSheet(canvas: HTMLCanvasElement): void {
        const ctx = canvas.getContext('2d')

        if (!ctx || !this.sheetImage || !this.sprite) {
            return
        }

        ctx.imageSmoothingEnabled = false
        ctx.drawImage(this.sheetImage, 0, 0)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)'
        ctx.lineWidth = 1

        for (let x = 0; x < canvas.width; x += this.sprite.frameWidth) {
            for (let y = 0; y < canvas.height; y += this.sprite.frameHeight) {
                ctx.strokeRect(x + 0.5, y + 0.5, this.sprite.frameWidth - 1, this.sprite.frameHeight - 1)
            }
        }

        const current = this.selectedFrame()

        if (current !== undefined) {
            ctx.strokeStyle = '#0078D7'
            ctx.lineWidth = 2
            ctx.strokeRect(current.x + 1, current.y + 1, current.width - 2, current.height - 2)
        }
    }

    private selectedFrame(): Rect | undefined {
        if (this.sprite === undefined) {
            return undefined
        }

        const frames = this.sprite.directions[this.selected.direction]

        return this.selected.slot === 'idle' ? frames.idle : frames.walk[this.selected.slot]
    }

    private paintFrame(canvas: HTMLCanvasElement, frame: Rect): void {
        const ctx = canvas.getContext('2d')

        if (!ctx || !this.sheetImage) {
            return
        }

        ctx.imageSmoothingEnabled = false
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(this.sheetImage, frame.x, frame.y, frame.width, frame.height, 0, 0, canvas.width, canvas.height)
    }

    private startPreview(): void {
        this.stopPreview()

        const tick = (): void => {
            const canvas = this.shadowRoot?.querySelector('.preview-canvas')

            if (!(canvas instanceof HTMLCanvasElement) || this.sprite === undefined) {
                return
            }

            const phase = (performance.now() % PREVIEW_CYCLE_MS) / PREVIEW_CYCLE_MS

            this.paintFrame(canvas, pickFrame(this.sprite, this.selected.direction, phase, false))
        }

        this.previewTimer = window.setInterval(tick, 1000 / 30)
    }

    private stopPreview(): void {
        if (this.previewTimer !== undefined) {
            window.clearInterval(this.previewTimer)
            this.previewTimer = undefined
        }
    }

    protected connectedCallback(): void {
        super.connectedCallback()

        if (this.isConnected) {
            this.startPreview()
        }
    }

    protected disconnectedCallback(): void {
        this.stopPreview()
        super.disconnectedCallback()
    }

    private async setSprite(sprite: SpriteDefinition | undefined): Promise<void> {
        this.sprite = sprite
        this.selected = { direction: 'down', slot: 'idle' }
        await this.loadSheet()
        this.patch()
    }

    /** Saves the working copy and re-reads the project's list so the select stays in step. */
    private async save(sprite: SpriteDefinition): Promise<void> {
        await projectRepository.saveSprite(sprite)

        this.sprites = (await projectRepository.load()).sprites
        this.sprite = sprite
        this.patch()
    }

    private async handleSpriteSelect(event: Event): Promise<void> {
        if (!(event.target instanceof HTMLSelectElement)) {
            return
        }

        const id = event.target.value

        await this.setSprite(this.sprites.find(sprite => sprite.id === id))
    }

    private async handleNewSprite(): Promise<void> {
        const sheet = this.sheets.find(candidate => candidate.id === this.sprite?.sheetId) ?? this.sheets[0]

        if (sheet === undefined) {
            return
        }

        const name = window.prompt('Sprite name', 'Sprite ' + (this.sprites.length + 1))

        if (name === null || name.trim() === '') {
            return
        }

        const { id: _id, ...input } = newSpriteDefinition('', name.trim(), sheet.id, DEFAULT_FRAME_SIZE.width, DEFAULT_FRAME_SIZE.height)
        const created = await projectRepository.createSprite(input)

        this.sprites = (await projectRepository.load()).sprites
        await this.setSprite(created)
    }

    private async handleRenameSprite(): Promise<void> {
        if (this.sprite === undefined) {
            return
        }

        const name = window.prompt('Sprite name', this.sprite.name)

        if (name === null || name.trim() === '') {
            return
        }

        await this.save({ ...this.sprite, name: name.trim() })
    }

    private async handleDeleteSprite(): Promise<void> {
        if (this.sprite === undefined || !window.confirm(`Delete sprite "${this.sprite.name}"?`)) {
            return
        }

        await projectRepository.deleteSprite(this.sprite.id)

        const project = await projectRepository.load()

        this.sprites = project.sprites
        this.playerSpriteId = project.playerSpriteId
        await this.setSprite(this.sprites[0])
    }

    private async handleSheetSelect(event: Event): Promise<void> {
        if (this.sprite === undefined || !(event.target instanceof HTMLSelectElement)) {
            return
        }

        this.sprite = { ...this.sprite, sheetId: event.target.value }
        await this.loadSheet()
        await this.save(this.sprite)
    }

    private async handleFrameSize(): Promise<void> {
        const width = this.shadowRoot?.querySelector('.frame-width')
        const height = this.shadowRoot?.querySelector('.frame-height')

        if (this.sprite === undefined || !(width instanceof HTMLInputElement) || !(height instanceof HTMLInputElement)) {
            return
        }

        const frameWidth = Number(width.value)
        const frameHeight = Number(height.value)

        if (!Number.isInteger(frameWidth) || !Number.isInteger(frameHeight) || frameWidth < 1 || frameHeight < 1) {
            return
        }

        // Frames keep their origin and take the new size; the author re-picks any that no longer line up.
        const resize = (frame: Rect): Rect => ({ ...frame, width: frameWidth, height: frameHeight })
        const directions = { ...this.sprite.directions }

        for (const direction of DIRECTIONS) {
            const frames = directions[direction]

            directions[direction] = { idle: resize(frames.idle), walk: frames.walk.map(resize) }
        }

        await this.save({ ...this.sprite, frameWidth, frameHeight, directions })
    }

    private async handlePlayerToggle(): Promise<void> {
        if (this.sprite === undefined) {
            return
        }

        const next = this.sprite.id === this.playerSpriteId ? null : this.sprite.id

        await projectRepository.setPlayerSprite(next)
        this.playerSpriteId = next
        this.patch()
    }

    private slotFromElement(target: EventTarget | null): Slot | undefined {
        if (!(target instanceof HTMLElement)) {
            return undefined
        }

        const element = target.closest('[data-direction]')

        if (!(element instanceof HTMLElement)) {
            return undefined
        }

        const direction = element.dataset.direction
        const slot = element.dataset.slot

        if (!DIRECTIONS.includes(direction as Direction) || slot === undefined) {
            return undefined
        }

        return { direction: direction as Direction, slot: slot === 'idle' ? 'idle' : Number(slot) }
    }

    private handleSlotClick(event: MouseEvent): void {
        const slot = this.slotFromElement(event.currentTarget)

        if (slot === undefined || this.sprite === undefined) {
            return
        }

        this.selected = slot
        this.patch()
    }

    private async handleRemoveFrame(event: MouseEvent): Promise<void> {
        event.stopPropagation()

        const slot = this.slotFromElement(event.currentTarget)

        if (slot === undefined || slot.slot === 'idle' || this.sprite === undefined) {
            return
        }

        this.selected = { direction: slot.direction, slot: 'idle' }
        await this.save(withoutWalkFrame(this.sprite, slot.direction, slot.slot))
    }

    /** Assigns the clicked frame to the selected slot. An "add" slot appends a new walk frame. */
    private async handleSheetMouseDown(event: MouseEvent): Promise<void> {
        if (event.button !== LEFT_BUTTON || !(event.currentTarget instanceof HTMLCanvasElement) || this.sprite === undefined) {
            return
        }

        const bounds = event.currentTarget.getBoundingClientRect()
        const x = Math.floor((event.clientX - bounds.left) / this.sprite.frameWidth) * this.sprite.frameWidth
        const y = Math.floor((event.clientY - bounds.top) / this.sprite.frameHeight) * this.sprite.frameHeight
        const frame: Rect = { x, y, width: this.sprite.frameWidth, height: this.sprite.frameHeight }
        const next = withFrame(this.sprite, this.selected.direction, this.selected.slot, frame)

        if (this.selected.slot !== 'idle') {
            // Appending clamps the slot to the frame that was actually written.
            this.selected = { direction: this.selected.direction, slot: Math.min(this.selected.slot, next.directions[this.selected.direction].walk.length - 1) }
        }

        await this.save(next)
    }
}
