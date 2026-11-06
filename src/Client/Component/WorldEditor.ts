import { MapCanvas } from 'Client/Component/Canvas/MapCanvas'
import { CanvasTools } from 'Client/Component/Canvas/CanvasTools'
import { BasicModal } from 'Client/Component/Generic/Modal/BasicModal'
import { LayerListing } from 'Client/Component/LayerListing/LayerListing'
import { MapSelect } from 'Client/Component/MapSelect/MapSelect'
import { NewLayerForm } from 'Client/Component/NewLayerForm/NewLayerForm'
import { SideMenu } from 'Client/Component/SideMenu/SideMenu'
import { SheetImporter } from 'Client/Component/SpriteSheets/SheetImporter/SheetImporter'
import { SheetViewer } from 'Client/Component/SpriteSheets/SheetViewer/SheetViewer'
import { SpriteEditor } from 'Client/Component/Sprite/SpriteEditor'
import { TilesetPalette } from 'Client/Component/Tileset/TilesetPalette'
import { WindowBox } from 'Client/Component/WindowBox/WindowBox'
import { componentId } from 'Client/Constants/components'
import { Component, ExternalListeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { camera } from 'Client/Service/camera'
import { mapSession } from 'Client/Service/map-session'
import { projectRepository } from 'Client/Service/Repository/ProjectRepository'
import { activeMapId, urlForMap } from 'Client/Service/active-map'
import { Id } from 'domain/id'
import { findMap, GameMap } from 'domain/project'
import { sheetRepository } from 'Client/Service/Repository/SheetRepository'
import { userDataRepository } from 'Client/Service/Repository/UserDataRepository'
import { WindowBoxFactory } from 'Client/Service/WindowBoxFactory'
import { View } from 'engine/view'
import { UserData, WindowConfiguration } from 'Model/UserData'
import { DialogEditor } from 'Client/Component/Dialog/DialogEditor'

/**
 * The editor page: picks the map, mounts the side menu, tool bar, and the one
 * map canvas, and opens floating windows. Map edits live in `mapSession` and
 * the components that own them, not here.
 */
export class WorldEditor extends Component {
    private windowBoxes: { [key: string]: WindowBox } = {}
    private userData!: UserData
    /** Undefined when the project has no maps: the editor shows an empty state with the map list. */
    private map: GameMap | undefined

    protected externalListeners: ExternalListeners = {
        'open-sheet': this.handleOpenSheet,
        'open-tileset-palette': this.handleOpenTilesetPalette,
        'window-destroyed': this.handleWindowDestroyed,
        'mouse-down-window-box': this.handleMouseDownWindowBox,
        'open-sheet-importer': this.handleOpenSheetImporter,
        'open-add-new-layer': this.handleOpenAddNewLayer,
        'open-sprite-editor': this.handleOpenSpriteEditor,
        'open-dialog-editor': this.handleOpenDialogEditor,
        'updated-view-coordinates': this.handleUpdateViewCoordinates,
        'grid-toggled': this.handleGridToggled,
        'window-update': this.handleWindowUpdate,
    }

    protected css(): string {
        return /*css*/`
            .container {
                display: block;
                position: relative;
                width: 100%;
                height: 100%;
                overflow: hidden;
                display: flex;
            }

            .canvas-container {
                flex-grow: 1;
                position: relative;
            }

            .empty-state {
                position: absolute;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #bbb;
                background: #2b2b2b;
                font-size: 16px;
            }
        `
    }

    protected async setup(): Promise<void> {
        const project = await projectRepository.load()
        const mapId = activeMapId(window.location.search, project)

        this.map = mapId === undefined ? undefined : findMap(project, mapId)

        if (this.map !== undefined) {
            mapSession.open(this.map)
            this.pointPlayLinkAtMap(this.map.id)
        }

        this.userData = await userDataRepository.getAll()

        camera.set({ ...this.userData.lastViewPosition, zoom: this.userData.zoom ?? 1 })

        await sheetRepository.getAll()
    }

    protected build(): HTMLElement {
        const container = Dom.div('container')
        const sideMenu = Dom.makeComponent(SideMenu)
        const canvasContainer = Dom.div('canvas-container')

        sideMenu.append(Dom.makeComponent(MapSelect, { activeMapId: this.map?.id ?? null }))

        if (this.map === undefined) {
            const empty = Dom.div('empty-state')

            empty.textContent = 'This project has no maps yet. Use "+ Map" to create one.'
            canvasContainer.append(empty)
            container.append(sideMenu, canvasContainer)

            return container
        }

        sideMenu.append(Dom.makeComponent(LayerListing))

        const tools = Dom.makeComponent(CanvasTools, { currentTool: this.userData.currentTool })

        canvasContainer.append(Dom.makeComponent(MapCanvas, { map: this.map, showGrid: this.userData.showGrid ?? true }))

        container.append(
            sideMenu,
            tools,
            canvasContainer
        )

        return container
    }

    /** The play link lives in the page body, outside any component. */
    private pointPlayLinkAtMap(mapId: Id): void {
        const link = document.getElementById('play')

        if (link instanceof HTMLAnchorElement) {
            link.href = urlForMap('/play', mapId)
        }
    }

    private handleOpenSheet(sheetId: string): void {
        const sheet = sheetRepository.getById(sheetId)

        if (sheet === undefined) {
            return
        }

        const openWindow = this.windowBoxes[sheet.id]

        if (openWindow && openWindow.isConnected) {
            openWindow.flash()
            return
        }

        const sheetViewerDataset = { sheetId: sheet.id, sheetName: sheet.name, imageSrc: sheet.imageSrc }
        const component = Dom.makeComponent(SheetViewer, sheetViewerDataset)

        const windowBox = WindowBoxFactory.make(component, sheet.name, {
            uuid: componentId(SheetViewer),
            componentConfigration: { dataset: sheetViewerDataset },
            title: sheet.name,
        })

        if (windowBox) {
            // Keyed by sheet id, since two uploads may share a display name.
            this.windowBoxes[sheet.id] = windowBox

            this.shadowRoot?.append(windowBox)
        }
    }

    /** Opens the palette for `tilesetId`, or for the active map's tileset, or the project's first tileset. */
    private async handleOpenTilesetPalette(tilesetId: Id | undefined): Promise<void> {
        const project = await projectRepository.load()
        const tileset = project.tilesets.find(candidate => candidate.id === tilesetId)
            ?? project.tilesets.find(candidate => candidate.id === this.map?.tileMap.tilesetId)
            ?? project.tilesets[0]

        if (tileset === undefined) {
            return
        }

        const key = 'palette:' + tileset.id
        const openWindow = this.windowBoxes[key]

        if (openWindow && openWindow.isConnected) {
            openWindow.flash()
            return
        }

        const windowBox = WindowBoxFactory.make(
            Dom.makeComponent(TilesetPalette, { tilesetId: tileset.id }),
            'Tileset: ' + tileset.name,
            {
                uuid: componentId(TilesetPalette),
                componentConfigration: { dataset: { tilesetId: tileset.id } },
                title: 'Tileset: ' + tileset.name,
            },
        )

        if (windowBox) {
            this.windowBoxes[key] = windowBox
            this.shadowRoot?.append(windowBox)
        }
    }

    /** The event carries a title, not a key, so prune by connection instead. */
    private handleWindowDestroyed(): void {
        for (const [key, windowBox] of Object.entries(this.windowBoxes)) {
            if (!windowBox.isConnected) {
                delete this.windowBoxes[key]
            }
        }
    }

    private handleMouseDownWindowBox(windowBox: WindowBox): void {
        const all = Dom.getAllOfComponent<WindowBox>(WindowBox)

        for (const one of all) {
            one.zIndexMoveDown()
        }

        windowBox.zIndexMoveUp()
    }

    private handleOpenSheetImporter(): void {
        const component = Dom.makeComponent(SheetImporter)
        const windowBox = WindowBoxFactory.make(component, 'Import Sheets', {
            uuid: componentId(SheetImporter),
            componentConfigration: { dataset: {} },
            title: 'Import Sheets',
        })

        if (windowBox) {
            this.shadowRoot?.append(windowBox)
        }
    }

    private handleOpenAddNewLayer(): void {
        const modal = Dom.makeComponent(BasicModal)
        const newLayerForm = Dom.makeComponent(NewLayerForm)

        modal.append(newLayerForm)

        this.shadowRoot?.append(
            modal
        )
    }

    private async handleUpdateViewCoordinates(view: View): Promise<void> {
        const userData = await userDataRepository.getAll()

        userData.lastViewPosition.x = view.x
        userData.lastViewPosition.y = view.y
        userData.zoom = view.zoom

        userDataRepository.persist(userData)
    }

    private async handleGridToggled(showGrid: boolean): Promise<void> {
        const userData = await userDataRepository.getAll()

        userData.showGrid = showGrid

        userDataRepository.persist(userData)
    }

    private async handleWindowUpdate(windowConfiguration: WindowConfiguration): Promise<void> {
        const userData = await userDataRepository.getAll()

        userData.windows[windowConfiguration.uuid] = windowConfiguration

        userDataRepository.persist(userData)
    }

    private async handleOpenDialogEditor(dialogId: Id | undefined): Promise<void> {
        const key = 'dialogs'
        const openWindow = this.windowBoxes[key]

        if (openWindow && openWindow.isConnected) {
            openWindow.flash()
            return
        }

        const dataset = { dialogId: dialogId ?? null }
        const windowBox = WindowBoxFactory.make(Dom.makeComponent(DialogEditor, dataset), 'Dialogs', {
            uuid: componentId(DialogEditor),
            componentConfigration: { dataset },
            title: 'Dialogs',
        })

        if (windowBox) {
            this.windowBoxes[key] = windowBox
            this.shadowRoot?.append(windowBox)
        }
    }

    private async handleOpenSpriteEditor(spriteId: Id | undefined): Promise<void> {
        const key = 'sprites'
        const openWindow = this.windowBoxes[key]

        if (openWindow && openWindow.isConnected) {
            openWindow.flash()
            return
        }

        const dataset = { spriteId: spriteId ?? null }
        const windowBox = WindowBoxFactory.make(Dom.makeComponent(SpriteEditor, dataset), 'Sprites', {
            uuid: componentId(SpriteEditor),
            componentConfigration: { dataset },
            title: 'Sprites',
        })

        if (windowBox) {
            this.windowBoxes[key] = windowBox
            this.shadowRoot?.append(windowBox)
        }
    }
}
