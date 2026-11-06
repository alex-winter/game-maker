import { LEFT_BUTTON, MIDDLE_BUTTON } from 'Client/Constants/mouse-events'
import { Component, ExternalListeners, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { Brush, BRUSH_CHANGED, brush } from 'Client/Service/brush'
import { buildScene } from 'Client/Service/build-scene'
import { camera } from 'Client/Service/camera'
import { canvasDrawPort } from 'Client/Service/canvas-draw-port'
import { drawAttributes } from 'Client/Service/draw-attributes'
import { drawEvents } from 'Client/Service/draw-events'
import { BasicModal } from 'Client/Component/Generic/Modal/BasicModal'
import { WARP_DELETE, WARP_SUBMIT, WarpForm } from 'Client/Component/Events/WarpForm'
import { SIGN_DELETE, SIGN_SUBMIT, SignForm } from 'Client/Component/Events/SignForm'
import { ITEM_DELETE, ITEM_SUBMIT, ItemForm } from 'Client/Component/Events/ItemForm'
import { NPC_DELETE, NPC_SUBMIT, NpcForm } from 'Client/Component/Events/NpcForm'
import { npcActor } from 'engine/npc-actor'
import { newPlayer } from 'domain/movement'
import { findSprite } from 'domain/project'
import { EVENT_KIND_PICK, EventKindPick, EventKindPicker } from 'Client/Component/Events/EventKindPicker'
import { newId } from 'domain/id'
import { eventsAt, ItemEvent, newItemEvent, newNpcEvent, newSign, newWarp, NpcEvent, npcsOn, Sign, Warp, withEvent, withoutEvent } from 'domain/warp'
import { drawGrid } from 'Client/Service/draw-grid'
import { loadLegacyPlacements } from 'Client/Service/load-legacy-placements'
import { MAP_SESSION_CHANGED, mapSession } from 'Client/Service/map-session'
import { pointerToWorld } from 'Client/Service/pointer-to-world'
import { projectRepository, TILESET_CHANGED } from 'Client/Service/Repository/ProjectRepository'
import { sheetRepository } from 'Client/Service/Repository/SheetRepository'
import { isTool, Tool } from 'Client/Service/tool'
import { LoadedPlacement } from 'Client/Model/LoadedPlacement'
import { Cell, Coordinates } from 'domain/coordinates'
import { GRID_SIZE, pixelToCell } from 'domain/grid'
import { Id } from 'domain/id'
import { TileLayer, TileMap, floodFill, floodFillCells, gateAt, withCell, withCellsRect, withCollision, withElevation, withGate, withGrass, withRect, withTile, withTileLayer } from 'domain/map'
import { GATE_REMOVE, GATE_SUBMIT, GateForm, GateSubmission } from 'Client/Component/Events/GateForm'
import { GameMap } from 'domain/project'
import { EMPTY_METATILE_ID, metatileById, MetatileId } from 'domain/tileset'
import { DrawPort } from 'engine/draw-port'
import { startLoop } from 'engine/loop'
import { renderFrame } from 'engine/render'
import { Scene } from 'engine/scene'
import { clampZoom, MAX_ZOOM, MIN_ZOOM, View, worldToScreen } from 'engine/view'

/**
 * A stroke's edits as pure functions on the grid, chosen by the paint target:
 * metatile ids on a tile layer, or 0/1 and levels on the attribute grids.
 */
type CellWriter = {
    readonly one: (tileMap: TileMap, cell: Cell) => TileMap

    readonly rect: (tileMap: TileMap, a: Cell, b: Cell) => TileMap

    readonly fill: (tileMap: TileMap, start: Cell) => TileMap
}

/**
 * The one canvas the editor draws the active map into, through the engine's
 * `renderFrame`. It owns the pointer: pencil, fill, rectangle, and rubber
 * write onto the session's paint target; the middle button pans.
 */
export class MapCanvas extends Component<{ map: GameMap; showGrid: boolean }> {
    private sheetById = new Map<Id, CanvasImageSource>()
    private background: LoadedPlacement[] = []
    private scene: Scene<CanvasImageSource> | undefined
    private port: DrawPort<CanvasImageSource> | undefined
    private stopLoop: (() => void) | undefined
    private resizeObserver: ResizeObserver | undefined

    private tool: Tool = 'pencil'
    private isPanning: boolean = false
    private lastMousePosition: Coordinates = { x: 0, y: 0 }
    private showGrid: boolean = true
    private hoveredCell: Cell | undefined

    protected readonly externalListeners: ExternalListeners = {
        [MAP_SESSION_CHANGED]: this.invalidate,
        [TILESET_CHANGED]: this.invalidate,
        [BRUSH_CHANGED]: this.redrawGhost,
        'tool-selection': this.handleToolSelection,
        [WARP_SUBMIT]: this.handleWarpSubmit,
        [WARP_DELETE]: this.handleWarpDelete,
        [SIGN_SUBMIT]: this.handleSignSubmit,
        [SIGN_DELETE]: this.handleSignDelete,
        [ITEM_SUBMIT]: this.handleItemSubmit,
        [ITEM_DELETE]: this.handleItemDelete,
        [NPC_SUBMIT]: this.handleNpcSubmit,
        [NPC_DELETE]: this.handleNpcDelete,
        [GATE_SUBMIT]: this.handleGateSubmit,
        [GATE_REMOVE]: this.handleGateRemove,
        [EVENT_KIND_PICK]: this.handleEventKindPick,
    }

    protected readonly listeners: Listeners = {
        '.container:mouseleave': this.handleMouseLeave,
        '.container:mousedown': this.handleMouseDown,
        '.container:mousemove': this.handleMouseMove,
        '.container:mouseup': this.handleMouseUp,
        '.container:contextmenu': this.handleContextMenu,
        '.container:wheel': this.handleWheel,
        '.zoom-in:click': this.handleZoomIn,
        '.zoom-out:click': this.handleZoomOut,
        '.grid-toggle:change': this.handleGridToggle,
    }

    protected css(): string {
        return /*css*/`
            :host {
                display: block;
                position: absolute;
                inset: 0;
            }

            .container {
                position: relative;
                width: 100%;
                height: 100%;
                overflow: hidden;
                background: #2b2b2b;
            }

            canvas {
                display: block;
                image-rendering: pixelated;
            }

            .ghost {
                position: absolute;
                pointer-events: none;
                image-rendering: pixelated;
                opacity: 0.7;
                outline: 1px solid rgba(255, 255, 255, 0.8);
            }

            .hud {
                position: absolute;
                left: 12px;
                bottom: 12px;
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 6px 10px;
                border-radius: 6px;
                background: rgba(0, 0, 0, 0.6);
                color: #eee;
                font: 13px/1 monospace;
                user-select: none;
            }

            .hud button {
                width: 24px;
                height: 24px;
                border: none;
                border-radius: 4px;
                background: #444;
                color: #eee;
                cursor: pointer;
            }

            .hud button:disabled {
                opacity: 0.4;
                cursor: default;
            }

            .hud label {
                display: flex;
                align-items: center;
                gap: 4px;
                cursor: pointer;
            }

            .readout {
                min-width: 9ch;
            }

            .ghost.hide, .selection.hide {
                display: none;
            }

            .selection {
                position: absolute;
                pointer-events: none;
                border: 1px solid #ffd54f;
                background: rgba(255, 213, 79, 0.25);
            }
        `
    }

    protected async setup(): Promise<void> {
        this.showGrid = this.parsedDataset.showGrid

        await Promise.all([this.loadSheets(), this.loadBackground()])
    }

    protected build(): HTMLElement {
        const container = Dom.div('container')
        const canvas = Dom.canvas()
        const ghost = Dom.canvas(GRID_SIZE, GRID_SIZE)
        const selection = Dom.div('selection', 'hide')

        ghost.classList.add('ghost', 'hide')

        container.append(canvas, ghost, selection, this.buildHud())

        return container
    }

    /** Zoom buttons, the grid toggle, and the cell under the cursor. */
    private buildHud(): HTMLElement {
        const hud = Dom.div('hud')
        const zoomOut = Dom.button('−', 'zoom-out')
        const zoomIn = Dom.button('+', 'zoom-in')
        const zoomLabel = Dom.span(camera.get().zoom + '×', 'zoom-label')
        const gridToggle = document.createElement('input')
        const gridLabel = document.createElement('label')
        const readout = Dom.span('—', 'readout')

        zoomOut.title = 'Zoom out'
        zoomIn.title = 'Zoom in'
        gridToggle.type = 'checkbox'
        gridToggle.className = 'grid-toggle'
        gridToggle.checked = this.showGrid
        gridLabel.append(gridToggle, 'Grid')

        hud.append(zoomOut, zoomLabel, zoomIn, gridLabel, readout)

        return hud
    }

    private updateHud(): void {
        const zoom = camera.get().zoom
        const label = this.findOne('.zoom-label')
        const zoomIn = this.findOne('.zoom-in')
        const zoomOut = this.findOne('.zoom-out')
        const readout = this.findOne('.readout')

        if (label) label.textContent = zoom + '×'
        if (zoomIn instanceof HTMLButtonElement) zoomIn.disabled = zoom >= MAX_ZOOM
        if (zoomOut instanceof HTMLButtonElement) zoomOut.disabled = zoom <= MIN_ZOOM
        if (readout) readout.textContent = this.hoveredCell === undefined ? '—' : `${this.hoveredCell.x}, ${this.hoveredCell.y}`
    }

    protected afterBuild(): void {
        const canvas = this.getCanvas()
        const ctx = canvas?.getContext('2d')

        if (!canvas || !ctx) {
            return
        }

        this.port = canvasDrawPort(ctx)

        this.resizeObserver = new ResizeObserver(() => this.fitCanvas())
        this.resizeObserver.observe(this)
        this.fitCanvas()
        this.redrawGhost()
        this.updateHud()

        this.stopLoop = startLoop(() => this.frame(), callback => window.requestAnimationFrame(callback))

        window.addEventListener('keydown', this.onKeyDown)
    }

    protected disconnectedCallback(): void {
        this.stopLoop?.()
        this.resizeObserver?.disconnect()
        window.removeEventListener('keydown', this.onKeyDown)
        super.disconnectedCallback()
    }

    /** Ctrl/Cmd+Z undoes, Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y redoes, unless the user is typing in a field. */
    private readonly onKeyDown = (event: KeyboardEvent): void => {
        const typing = event.composedPath().some(node =>
            node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement || node instanceof HTMLSelectElement)

        if (typing || !(event.ctrlKey || event.metaKey)) {
            return
        }

        const key = event.key.toLowerCase()

        if (key === 'z' && !event.shiftKey) {
            event.preventDefault()
            void mapSession.undo()
        } else if ((key === 'z' && event.shiftKey) || key === 'y') {
            event.preventDefault()
            void mapSession.redo()
        }
    }

    /** Every sheet the project may cut metatiles from, decoded once. */
    private async loadSheets(): Promise<void> {
        const sheets = await sheetRepository.getAll()
        const images = await Promise.all(sheets.map(sheet => Dom.image(sheet.imageSrc)))

        sheets.forEach((sheet, index) => this.sheetById.set(sheet.id, images[index]))
    }

    /** A map painted before metatiles keeps its pictures as a frozen, read-only background. */
    private async loadBackground(): Promise<void> {
        this.background = await loadLegacyPlacements(this.parsedDataset.map.layers)
    }

    private fitCanvas(): void {
        const canvas = this.getCanvas()

        if (canvas && (canvas.width !== this.clientWidth || canvas.height !== this.clientHeight)) {
            canvas.width = this.clientWidth
            canvas.height = this.clientHeight
        }
    }

    /** Marks the scene stale; the next frame rebuilds it from the session. */
    private invalidate(): void {
        this.scene = undefined
    }

    private currentScene(): Scene<CanvasImageSource> {
        if (this.scene === undefined) {
            const map = mapSession.current

            this.scene = buildScene({
                tileMap: mapSession.visibleTileMap(),
                tileset: projectRepository.cachedTileset(map.tileMap.tilesetId),
                sheetById: this.sheetById,
                layers: map.layers,
                loadedPlacements: this.background,
            })
        }

        return this.scene
    }

    private frame(): void {
        const ctx = this.getCanvas()?.getContext('2d')

        if (this.port === undefined || !ctx) {
            return
        }

        const view = camera.get()
        const tileMap = mapSession.tileMap

        // The editor previews animated tiles on the wall clock, so water moves while the author paints it.
        renderFrame(this.port, this.currentScene(), view, this.npcActors(), performance.now())

        if (this.showGrid) {
            drawGrid(ctx, view, tileMap)
        }

        drawAttributes(ctx, view, tileMap, projectRepository.cachedTileset(tileMap.tilesetId), {
            collision: !mapSession.isHidden('collision'),
            elevation: !mapSession.isHidden('elevation'),
            grass: !mapSession.isHidden('grass'),
            gate: !mapSession.isHidden('gate'),
        })

        if (!mapSession.isHidden('events')) {
            drawEvents(ctx, view, mapSession.current.events)
        }
    }

    /** People stand on the map in the editor too, so the author sees where they are and how they face. */
    private npcActors() {
        const project = projectRepository.cachedProject

        return npcsOn(mapSession.current.events).map(npc => npcActor(npc, newPlayer(npc.cell, npc.facing), spriteId => {
            const sprite = project === undefined ? undefined : findSprite(project, spriteId)
            const image = sprite === undefined ? undefined : this.sheetById.get(sprite.sheetId)

            return sprite === undefined || image === undefined ? undefined : { sprite, image }
        }))
    }

    private getCanvas(): HTMLCanvasElement | null {
        return this.findOne('canvas:not(.ghost)')
    }

    private getGhost(): HTMLCanvasElement | null {
        return this.findOne('canvas.ghost')
    }

    private getSelection(): HTMLDivElement | null {
        return this.findOne('.selection')
    }

    private getContainer(): HTMLDivElement | null {
        return this.findOne('.container')
    }

    private containerRect(): { left: number; top: number } {
        const container = this.getContainer()

        return container ? container.getBoundingClientRect() : { left: 0, top: 0 }
    }

    private cellAt(event: MouseEvent): Cell {
        return pixelToCell(pointerToWorld(event, this.containerRect(), camera.get()))
    }

    /** Places an absolutely positioned overlay on a world rectangle given in cells. */
    private placeOverlay(element: HTMLElement, view: View, cell: Cell, widthCells: number, heightCells: number): void {
        const screen = worldToScreen(view, { x: cell.x * GRID_SIZE, y: cell.y * GRID_SIZE })
        const cellSize = GRID_SIZE * view.zoom

        element.style.left = screen.x + 'px'
        element.style.top = screen.y + 'px'
        element.style.width = (widthCells * cellSize) + 'px'
        element.style.height = (heightCells * cellSize) + 'px'
    }

    /**
     * The metatile id the current tool writes, or undefined when it cannot
     * paint: no brush, or a brush from a different tileset than the map uses.
     * A map without a tileset adopts the brush's tileset on the first stroke.
     */
    private paintIdFor(tool: Tool, current: Brush | undefined): MetatileId | undefined {
        if (tool === 'rubber') {
            return EMPTY_METATILE_ID
        }

        if (current === undefined) {
            return undefined
        }

        const tileMap = mapSession.tileMap

        if (tileMap.tilesetId === null) {
            mapSession.update({ ...tileMap, tilesetId: current.tilesetId })
        } else if (tileMap.tilesetId !== current.tilesetId) {
            console.info('The map uses a different tileset than the brush; pick a metatile from the map\'s tileset.')
            return undefined
        }

        return current.metatileId
    }

    /** The edits the current tool makes on the current target, or undefined when nothing can be painted. */
    private writerFor(tool: Tool): CellWriter | undefined {
        const target = mapSession.target

        if (target === undefined) {
            return undefined
        }

        if (target.kind === 'collision') {
            const value = tool === 'rubber' ? 0 : 1

            return {
                one: (m, cell) => withCollision(m, withCell(m, m.attributes.collision, cell, value)),
                rect: (m, a, b) => withCollision(m, withCellsRect(m, m.attributes.collision, a, b, value)),
                fill: (m, start) => withCollision(m, floodFillCells(m, m.attributes.collision, start, value, 0)),
            }
        }

        if (target.kind === 'grass') {
            const value = tool === 'rubber' ? 0 : 1

            return {
                one: (m, cell) => withGrass(m, withCell(m, m.attributes.grass, cell, value)),
                rect: (m, a, b) => withGrass(m, withCellsRect(m, m.attributes.grass, a, b, value)),
                fill: (m, start) => withGrass(m, floodFillCells(m, m.attributes.grass, start, value, 0)),
            }
        }

        if (target.kind === 'events' || target.kind === 'gate') {
            // Events and gates are placed one at a time through a form, not painted; see handleMouseDown.
            return undefined
        }

        if (target.kind === 'elevation') {
            const value = tool === 'rubber' ? 0 : mapSession.elevationBrush

            return {
                one: (m, cell) => withElevation(m, withCell(m, m.attributes.elevation, cell, value)),
                rect: (m, a, b) => withElevation(m, withCellsRect(m, m.attributes.elevation, a, b, value)),
                fill: (m, start) => withElevation(m, floodFillCells(m, m.attributes.elevation, start, value, 0)),
            }
        }

        const id = this.paintIdFor(tool, brush.get())

        if (id === undefined) {
            return undefined
        }

        const layerId = target.layerId
        const onLayer = (m: TileMap, edit: (layer: TileLayer) => TileLayer): TileMap => {
            const layer = m.layers.find(candidate => candidate.id === layerId)

            return layer === undefined ? m : withTileLayer(m, edit(layer))
        }

        return {
            one: (m, cell) => onLayer(m, layer => withTile(m, layer, cell, id)),
            rect: (m, a, b) => onLayer(m, layer => withRect(m, layer, a, b, id)),
            fill: (m, start) => onLayer(m, layer => floodFill(m, layer, start, id)),
        }
    }

    /** Redraws the one-cell ghost preview from the brush's rectangle on its sheet. */
    private redrawGhost(): void {
        const ghost = this.getGhost()
        const ctx = ghost?.getContext('2d')
        const current = brush.get()

        if (!ghost || !ctx) {
            return
        }

        ctx.clearRect(0, 0, GRID_SIZE, GRID_SIZE)

        if (current === undefined) {
            return
        }

        const tileset = projectRepository.cachedTileset(current.tilesetId)
        const metatile = tileset === undefined ? undefined : metatileById(tileset, current.metatileId)
        const sheet = metatile === undefined ? undefined : this.sheetById.get(metatile.sheetId)

        if (metatile === undefined || sheet === undefined) {
            return
        }

        ctx.imageSmoothingEnabled = false
        ctx.drawImage(sheet, metatile.x, metatile.y, metatile.w, metatile.h, 0, 0, GRID_SIZE, GRID_SIZE)
    }

    /** Moves the ghost preview to the cell under the pointer and updates the readout. */
    private trackPointer(event: MouseEvent): void {
        const ghost = this.getGhost()
        const cell = this.cellAt(event)

        this.hoveredCell = cell
        this.updateHud()

        if (!ghost) {
            return
        }

        if (this.tool === 'rubber' || brush.get() === undefined || mapSession.target?.kind !== 'layer') {
            ghost.classList.add('hide')
            return
        }

        ghost.classList.remove('hide')
        this.placeOverlay(ghost, camera.get(), cell, 1, 1)
    }

    private showSelection(a: Cell, b: Cell): void {
        const selection = this.getSelection()

        if (!selection) {
            return
        }

        selection.classList.remove('hide')
        this.placeOverlay(
            selection,
            camera.get(),
            { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y) },
            Math.abs(a.x - b.x) + 1,
            Math.abs(a.y - b.y) + 1,
        )
    }

    private hideSelection(): void {
        this.getSelection()?.classList.add('hide')
    }

    /** Screen-pixel drag → world-pixel pan: a drag moves fewer world pixels the further in you are. */
    private panTo(clientX: number, clientY: number): void {
        const zoom = camera.get().zoom

        camera.panBy(
            (this.lastMousePosition.x - clientX) / zoom,
            (this.lastMousePosition.y - clientY) / zoom,
        )

        this.lastMousePosition.x = clientX
        this.lastMousePosition.y = clientY
    }

    /** Pencil and rubber: one cell per pointer sample until mouseup, then one save. */
    private startStroke(firstEvent: MouseEvent, writer: CellWriter): void {
        const paint = (event: MouseEvent) => {
            mapSession.update(writer.one(mapSession.tileMap, this.cellAt(event)))
        }

        const mouseMove = (event: MouseEvent) => paint(event)

        const mouseUp = () => {
            document.removeEventListener('mouseup', mouseUp)
            document.removeEventListener('mousemove', mouseMove)

            void mapSession.save()
        }

        document.addEventListener('mouseup', mouseUp)
        document.addEventListener('mousemove', mouseMove)

        paint(firstEvent)
    }

    /** Rectangle: drag two corners, preview the span, fill it on mouseup. */
    private startRect(firstEvent: MouseEvent, writer: CellWriter): void {
        const start = this.cellAt(firstEvent)

        this.showSelection(start, start)

        const mouseMove = (event: MouseEvent) => this.showSelection(start, this.cellAt(event))

        const mouseUp = (event: MouseEvent) => {
            document.removeEventListener('mouseup', mouseUp)
            document.removeEventListener('mousemove', mouseMove)

            this.hideSelection()
            mapSession.update(writer.rect(mapSession.tileMap, start, this.cellAt(event)))

            void mapSession.save()
        }

        document.addEventListener('mouseup', mouseUp)
        document.addEventListener('mousemove', mouseMove)
    }

    private fillAt(event: MouseEvent, writer: CellWriter): void {
        mapSession.update(writer.fill(mapSession.tileMap, this.cellAt(event)))

        void mapSession.save()
    }

    private handleMouseDown(event: MouseEvent): void {
        this.trackPointer(event)

        if (event.button === MIDDLE_BUTTON) {
            event.preventDefault()
            this.isPanning = true
            this.lastMousePosition = { x: event.clientX, y: event.clientY }
            return
        }

        if (event.button !== LEFT_BUTTON || this.hudContains(event)) {
            return
        }

        if (mapSession.target?.kind === 'events') {
            this.handleEventClick(this.cellAt(event))
            return
        }

        if (mapSession.target?.kind === 'gate') {
            this.handleGateClick(this.cellAt(event))
            return
        }

        const writer = this.writerFor(this.tool)

        if (writer === undefined) {
            return
        }

        if (this.tool === 'fill') {
            this.fillAt(event, writer)
        } else if (this.tool === 'rect') {
            this.startRect(event, writer)
        } else {
            this.startStroke(event, writer)
        }
    }

    /**
     * On the events target a click edits the event on the cell through its
     * form, or asks which kind to place on an empty cell; the rubber removes
     * whatever is under the cursor.
     */
    private async handleEventClick(cell: Cell): Promise<void> {
        const map = mapSession.current

        if (cell.x < 0 || cell.y < 0 || cell.x >= map.tileMap.width || cell.y >= map.tileMap.height) {
            return
        }

        const existing = eventsAt(map.events, cell)

        if (this.tool === 'rubber') {
            if (existing.length > 0) {
                await mapSession.commitEvents(existing.reduce((events, event) => withoutEvent(events, event.id), map.events))
            }

            return
        }

        const [first] = existing

        if (first === undefined) {
            this.openModal(Dom.makeComponent(EventKindPicker, { cell }))
        } else if (first.kind === 'warp') {
            await this.openWarpForm(cell, first)
        } else if (first.kind === 'sign') {
            await this.openSignForm(cell, first)
        } else if (first.kind === 'item') {
            await this.openItemForm(cell, first)
        } else if (first.kind === 'npc') {
            await this.openNpcForm(cell, first)
        }
    }

    /** On the gates target a click opens the gate on the cell (or a new one) in its form; the rubber removes it. */
    private async handleGateClick(cell: Cell): Promise<void> {
        const map = mapSession.current

        if (cell.x < 0 || cell.y < 0 || cell.x >= map.tileMap.width || cell.y >= map.tileMap.height) {
            return
        }

        const gate = gateAt(map.tileMap, cell)

        if (this.tool === 'rubber') {
            if (gate !== null) {
                await mapSession.commit(withGate(map.tileMap, cell, null))
            }

            return
        }

        const project = await projectRepository.load()
        const sheets = await sheetRepository.getAll()
        const tileset = projectRepository.cachedTileset(map.tileMap.tilesetId)

        this.openModal(Dom.makeComponent(GateForm, {
            gate,
            cell,
            flags: project.flags.map(each => ({ id: each.id, name: each.name })),
            metatiles: tileset?.metatiles ?? [],
            sheetSources: Object.fromEntries(sheets.map(sheet => [sheet.id, sheet.imageSrc])),
        }))
    }

    private async handleGateSubmit(submission: GateSubmission): Promise<void> {
        await mapSession.commit(withGate(mapSession.tileMap, submission.cell, submission.gate))
    }

    private async handleGateRemove(cell: Cell): Promise<void> {
        await mapSession.commit(withGate(mapSession.tileMap, cell, null))
    }

    private async openNpcForm(cell: Cell, npc: NpcEvent | null): Promise<void> {
        const project = await projectRepository.load()

        this.openModal(Dom.makeComponent(NpcForm, {
            npc,
            cell,
            sprites: project.sprites.map(each => ({ id: each.id, name: each.name })),
            dialogs: project.dialogs.map(each => ({ id: each.id, name: each.name })),
            flags: project.flags.map(each => ({ id: each.id, name: each.name })),
            species: project.species.map(each => ({ id: each.id, name: each.name })),
        }))
    }

    private async handleNpcSubmit(submitted: Omit<NpcEvent, 'id'> & { id: Id | null }): Promise<void> {
        const map = mapSession.current
        const npc = newNpcEvent(submitted.id ?? newId(), submitted.cell, submitted.name, submitted.spriteId, submitted.facing, submitted.dialogId, submitted.behavior, submitted.trainer)

        await mapSession.commitEvents(withEvent(map.events, npc))
    }

    private async handleNpcDelete(eventId: Id): Promise<void> {
        await mapSession.commitEvents(withoutEvent(mapSession.current.events, eventId))
    }

    private async openItemForm(cell: Cell, event: ItemEvent | null): Promise<void> {
        const project = await projectRepository.load()
        const sheets = await sheetRepository.getAll()
        const tileset = projectRepository.cachedTileset(mapSession.current.tileMap.tilesetId)

        this.openModal(Dom.makeComponent(ItemForm, {
            event,
            cell,
            items: project.items.map(each => ({ id: each.id, name: each.name })),
            flags: project.flags.map(each => ({ id: each.id, name: each.name })),
            metatiles: tileset?.metatiles ?? [],
            sheetSources: Object.fromEntries(sheets.map(sheet => [sheet.id, sheet.imageSrc])),
        }))
    }

    private async handleItemSubmit(submitted: Omit<ItemEvent, 'id'> & { id: Id | null }): Promise<void> {
        const map = mapSession.current
        const event = newItemEvent(submitted.id ?? newId(), submitted.cell, submitted.itemId, submitted.flagId, submitted.metatileId)

        await mapSession.commitEvents(withEvent(map.events, event))
    }

    private async handleItemDelete(eventId: Id): Promise<void> {
        await mapSession.commitEvents(withoutEvent(mapSession.current.events, eventId))
    }

    private openModal(form: HTMLElement): void {
        const modal = Dom.makeComponent(BasicModal)

        modal.append(form)
        this.getRootNode().appendChild(modal)
    }

    private async openWarpForm(cell: Cell, warp: Warp | null): Promise<void> {
        const project = await projectRepository.load()

        this.openModal(Dom.makeComponent(WarpForm, {
            warp,
            cell,
            maps: project.maps.map(each => ({ id: each.id, name: each.name, size: { width: each.tileMap.width, height: each.tileMap.height } })),
        }))
    }

    private async openSignForm(cell: Cell, sign: Sign | null): Promise<void> {
        const project = await projectRepository.load()

        this.openModal(Dom.makeComponent(SignForm, {
            sign,
            cell,
            dialogs: project.dialogs.map(each => ({ id: each.id, name: each.name, firstPage: each.pages[0]?.text ?? '' })),
        }))
    }

    private async handleEventKindPick(pick: EventKindPick): Promise<void> {
        if (pick.kind === 'warp') {
            await this.openWarpForm(pick.cell, null)
        } else if (pick.kind === 'sign') {
            await this.openSignForm(pick.cell, null)
        } else if (pick.kind === 'item') {
            await this.openItemForm(pick.cell, null)
        } else {
            await this.openNpcForm(pick.cell, null)
        }
    }

    private async handleSignSubmit(submitted: Omit<Sign, 'id'> & { id: Id | null }): Promise<void> {
        const map = mapSession.current
        const sign = newSign(submitted.id ?? newId(), submitted.cell, submitted.dialogId)

        await mapSession.commitEvents(withEvent(map.events, sign))
    }

    private async handleSignDelete(signId: Id): Promise<void> {
        await mapSession.commitEvents(withoutEvent(mapSession.current.events, signId))
    }

    private async handleWarpSubmit(submitted: Omit<Warp, 'id'> & { id: Id | null }): Promise<void> {
        const map = mapSession.current
        const warp = newWarp(submitted.id ?? newId(), submitted.cell, submitted.toMapId, submitted.toCell, submitted.facing)

        await mapSession.commitEvents(withEvent(map.events, warp))
    }

    private async handleWarpDelete(warpId: Id): Promise<void> {
        await mapSession.commitEvents(withoutEvent(mapSession.current.events, warpId))
    }

    /** Clicks on the HUD are for its buttons, not the map. */
    private hudContains(event: MouseEvent): boolean {
        const hud = this.findOne('.hud')
        const pressed = event.composedPath()[0]

        return hud !== null && pressed instanceof Node && hud.contains(pressed)
    }

    private handleMouseMove(event: MouseEvent): void {
        if (this.isPanning) {
            this.panTo(event.clientX, event.clientY)
        }

        this.trackPointer(event)
    }

    private handleMouseUp(event: MouseEvent): void {
        if (event.button === MIDDLE_BUTTON && this.isPanning) {
            this.isPanning = false
            Events.emit('updated-view-coordinates', camera.get())
        }
    }

    private handleMouseLeave(): void {
        this.getGhost()?.classList.add('hide')
        this.hoveredCell = undefined
        this.updateHud()
    }

    /** Zooms one step toward the cursor; the camera position is saved like a pan. */
    private zoomBy(step: number, anchor: Coordinates): void {
        const before = camera.get()
        const next = clampZoom(before.zoom + step)

        if (next === before.zoom) {
            return
        }

        camera.zoomTo(next, anchor)
        this.updateHud()
        Events.emit('updated-view-coordinates', camera.get())
    }

    private canvasCentre(): Coordinates {
        return { x: (this.port?.width ?? 0) / 2, y: (this.port?.height ?? 0) / 2 }
    }

    private handleWheel(event: WheelEvent): void {
        event.preventDefault()

        const rect = this.containerRect()

        this.zoomBy(event.deltaY < 0 ? 1 : -1, { x: event.clientX - rect.left, y: event.clientY - rect.top })
    }

    private handleZoomIn(): void {
        this.zoomBy(1, this.canvasCentre())
    }

    private handleZoomOut(): void {
        this.zoomBy(-1, this.canvasCentre())
    }

    private handleGridToggle(event: Event): void {
        this.showGrid = event.target instanceof HTMLInputElement && event.target.checked
        Events.emit('grid-toggled', this.showGrid)
    }

    private handleContextMenu(event: Event): void {
        event.preventDefault()
    }

    private handleToolSelection(tool: string): void {
        if (isTool(tool)) {
            this.tool = tool
        }
    }
}
