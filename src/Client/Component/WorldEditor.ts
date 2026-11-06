import { MapCanvas } from 'Client/Component/Canvas/MapCanvas'
import { CanvasTools } from 'Client/Component/Canvas/CanvasTools'
import { BasicModal } from 'Client/Component/Generic/Modal/BasicModal'
import { LayerListing } from 'Client/Component/LayerListing/LayerListing'
import { MapSelect } from 'Client/Component/MapSelect/MapSelect'
import { NewLayerForm } from 'Client/Component/NewLayerForm/NewLayerForm'
import { PlacementHistory } from 'Client/Component/PlacementHistory/PlacementHistory'
import { SideMenu } from 'Client/Component/SideMenu/SideMenu'
import { SheetImporter } from 'Client/Component/SpriteSheets/SheetImporter/SheetImporter'
import { SheetViewer } from 'Client/Component/SpriteSheets/SheetViewer/SheetViewer'
import { WindowBox } from 'Client/Component/WindowBox/WindowBox'
import { componentId } from 'Client/Constants/components'
import { LayerInput } from 'Client/Model/LayerInput'
import { Component, ExternalListeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { LAYERS } from 'Client/Constants/layers'
import { camera } from 'Client/Service/camera'
import { loadPlacement } from 'Client/Service/load-placement'
import { layerRepository } from 'Client/Service/Repository/LayerRepository'
import { projectRepository } from 'Client/Service/Repository/ProjectRepository'
import { activeMapId, urlForMap } from 'Client/Service/active-map'
import { Id } from 'domain/id'
import { findMap, GameMap } from 'domain/project'
import { loadedPlacementRepository } from 'Client/Service/Repository/LoadedPlacement'
import { placementImageRepository } from 'Client/Service/Repository/PlacementImageRepository'
import { sheetRepository } from 'Client/Service/Repository/SheetRepository'
import { userDataRepository } from 'Client/Service/Repository/UserDataRepository'
import { WindowBoxFactory } from 'Client/Service/WindowBoxFactory'
import { Coordinates } from 'domain/coordinates'
import { LayerFactory } from 'Model/Factory/LayerFactory'
import { Layer } from 'Model/Layer'
import { UserData, WindowConfiguration } from 'Model/UserData'
import { DialogCreator } from './Dialog/DialogCreator'

export class WorldEditor extends Component {
    private windowBoxes: { [key: string]: WindowBox } = {}
    private layers: Layer[] = []
    private userData!: UserData
    private mapId!: Id
    private map!: GameMap

    protected externalListeners: ExternalListeners = {
        'open-sheet': this.handleOpenSheet,
        'window-destroyed': this.handleWindowDestroyed,
        'mouse-down-window-box': this.handleMouseDownWindowBox,
        'open-sheet-importer': this.handleOpenSheetImporter,
        'open-add-new-layer': this.handleOpenAddNewLayer,
        'open-add-player': this.handleOpenAddPlayer,
        'click-open-new-model': this.handleOpenNewModel,
        'click-open-history': this.handleOpenHistory,
        'new-layer-submit': this.handleNewLayerSubmit,
        'layer-placement-made': this.handleLayerPlacementMade,
        'layer-active': this.handleLayerActive,
        'layer-visible-toggle': this.handleLayerVisibleToggle,
        'layer-delete': this.handleLayerDelete,
        'updated-view-coordinates': this.handleUpdateViewCoordinates,
        'window-update': this.handleWindowUpdate,
        'request-placement-deletion': this.handleRequestPlacementDeletion,
        'layer-order-up': this.handleLayerOrderUp,
        'layer-order-down': this.handleLayerOrderDown,
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
        `
    }

    protected async setup(): Promise<void> {
        const project = await projectRepository.load()
        const mapId = activeMapId(window.location.search, project)
        const map = mapId === undefined ? undefined : findMap(project, mapId)

        if (mapId === undefined || map === undefined) {
            throw new Error('The project has no maps')
        }

        this.mapId = mapId
        this.map = map
        layerRepository.useMap(mapId)
        this.pointPlayLinkAtMap(mapId)

        this.userData = await userDataRepository.getAll()
        this.layers = await layerRepository.getAll()

        camera.set(this.userData.lastViewPosition)

        await sheetRepository.getAll()
        await placementImageRepository.getAll()

        for (const layer of this.layers) {
            for (const placement of layer.placements) {
                await loadPlacement(placement, layer.uuid)
            }
        }
    }

    protected build(): HTMLElement {
        const container = Dom.div('container')
        const sideMenu = Dom.makeComponent(SideMenu)
        const layerListing = Dom.makeComponent(LayerListing, { layers: this.layers })
        const canvasContainer = Dom.div('canvas-container')

        const dialogCreator = Dom.makeComponent(DialogCreator)

        const dialog = WindowBoxFactory.make(dialogCreator, 'dialog', {
            uuid: componentId(DialogCreator),
            componentConfigration: { dataset: {} },
            title: 'Dialog',
        })

        if(dialog){
            this.shadowRoot?.append(dialog)
        }

        sideMenu.append(
            Dom.makeComponent(MapSelect, { activeMapId: this.mapId }),
            layerListing,
        )

        const tools = Dom.makeComponent(CanvasTools, { currentTool: this.userData.currentTool })

        canvasContainer.append(
            Dom.makeComponent(MapCanvas, { map: this.map })
        )

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

        const sheetViewerDataset = { imageSrc: sheet.imageSrc }
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

    private async handleNewLayerSubmit(input: LayerInput): Promise<void> {
        const layer = Object.assign(
            LayerFactory.make(),
            input
        )

        // create assigns the order the layer is drawn in
        await layerRepository.create(layer)
    }

    private async handleOpenAddPlayer(): Promise<void> {
        const layer = Object.assign(
            LayerFactory.make(),
            {
                type: LAYERS.typePlayerControlled,
                name: 'Player',
                is_active: true,
            }
        ) as Layer

        await layerRepository.create(layer)
        layerRepository.setActive(layer.uuid)

        const size = 32
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')

        if (!ctx) {
            return
        }

        ctx.clearRect(0, 0, size, size)
        ctx.beginPath()
        ctx.fillStyle = 'blue'
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
        ctx.fill()

        const img = await Dom.image(canvas.toDataURL('image/png'))

        Events.emit('sheet-selection-made', img)
        Events.emit('tool-selection', 'pencil')
    }

    private handleLayerPlacementMade(layer: Layer): void {
        layerRepository.update(layer, 'placements')
    }

    private handleLayerActive(layer: Layer): void {
        layerRepository.setActive(layer.uuid)
    }

    private handleLayerVisibleToggle(layer: Layer): void {
        layerRepository.toggleVisible(layer.uuid)
    }

    private handleLayerDelete(uuid: string): void {
        layerRepository.remove(uuid)
            .then(() => {
                Events.emit('layer-deleted', uuid)
            })
    }

    private async handleUpdateViewCoordinates(corrdinates: Coordinates): Promise<void> {
        const userData = await userDataRepository.getAll()

        userData.lastViewPosition.x = corrdinates.x
        userData.lastViewPosition.y = corrdinates.y

        userDataRepository.persist(userData)
    }

    private async handleWindowUpdate(windowConfiguration: WindowConfiguration): Promise<void> {
        const userData = await userDataRepository.getAll()

        userData.windows[windowConfiguration.uuid] = windowConfiguration

        userDataRepository.persist(userData)
    }

    private handleOpenHistory(): void {
        const windowBox = WindowBoxFactory.make(
            Dom.makeComponent(PlacementHistory),
            'Placement History',
            {
                uuid: componentId(PlacementHistory),
                componentConfigration: { dataset: {} },
                title: 'Placement History',
            }
        )
        if (windowBox) {
            this.shadowRoot?.append(windowBox)
        }
    }

    private async handleRequestPlacementDeletion(placementUuid: string): Promise<void> {
        const layers = await layerRepository.getAll()

        loadedPlacementRepository.removeByUuid(placementUuid)

        for (const layer of layers) {
            const index = layer.placements.findIndex(p => p.uuid === placementUuid)
            if (index !== -1) {
                layer.placements.splice(index, 1)
                layerRepository.update(layer, 'placements')
                Events.emit('placement-removed', placementUuid)
                break
            }
        }
    }

    private async handleLayerOrderUp(layerUuid: string): Promise<void> {
        const layers: Layer[] = await layerRepository.getAll()

        layers.sort((a, b) => a.order - b.order)

        const index = layers.findIndex(l => l.uuid === layerUuid)

        if (index <= 0) return

        await this.swapOrder(layers[index], layers[index - 1])
    }

    private async handleLayerOrderDown(layerUuid: string): Promise<void> {
        const layers: Layer[] = await layerRepository.getAll()

        layers.sort((a, b) => a.order - b.order)

        const index = layers.findIndex(l => l.uuid === layerUuid)

        if (index === -1 || index >= layers.length - 1) return

        await this.swapOrder(layers[index], layers[index + 1])
    }

    private async swapOrder(a: Layer, b: Layer): Promise<void> {
        const tempOrder = a.order
        a.order = b.order
        b.order = tempOrder

        await Promise.all([
            layerRepository.update(a, 'order'),
            layerRepository.update(b, 'order'),
        ])
    }

    private handleOpenNewModel(): void {

    }
}