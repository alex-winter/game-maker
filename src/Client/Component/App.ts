import { CanvasLayer } from 'Client/Component/Canvas/CanvasLayer'
import { CanvasTools } from 'Client/Component/Canvas/CanvasTools'
import { BasicModal } from 'Client/Component/Generic/Modal/BasicModal'
import { LayerListing } from 'Client/Component/LayerListing/LayerListing'
import { NewLayerForm } from 'Client/Component/NewLayerForm/NewLayerForm'
import { PlacementHistory } from 'Client/Component/PlacementHistory/PlacementHistory'
import { SideMenu } from 'Client/Component/SideMenu/SideMenu'
import { SheetImporter } from 'Client/Component/SpriteSheets/SheetImporter/SheetImporter'
import { SheetViewer } from 'Client/Component/SpriteSheets/SheetViewer/SheetViewer'
import { WindowBox } from 'Client/Component/WindowBox/WindowBox'
import { COMPONENT_UUIDS_CONSTRUCT_LOOKUP } from 'Client/Constants/components'
import { LayerInput } from 'Client/Model/LayerInput'
import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { FileUpload } from 'Client/Service/FileUpload'
import { layerRepository } from 'Client/Service/Repository/LayerRepository'
import { loadedPlacementRepository } from 'Client/Service/Repository/LoadedPlacement'
import { placementImageRepository } from 'Client/Service/Repository/PlacementImageRepository'
import { sheetRepository } from 'Client/Service/Repository/SheetRepository'
import { userDataRepository } from 'Client/Service/Repository/UserDataRepository'
import { WindowBoxFactory } from 'Client/Service/WindowBoxFactory'
import { ExternalListeners } from 'event-driven-web-components/dist/types/ExternalListeners'
import { Coordinates } from 'Model/Coordinates'
import { LayerFactory } from 'Model/Factory/LayerFactory'
import { Layer } from 'Model/Layer'
import { UserData, WindowConfiguration } from 'Model/UserData'

export class App extends Component {
    private openSheets: string[] = []
    private windowBoxes: { [key: string]: WindowBox } = {}
    private layers: Layer[] = []
    private userData!: UserData

    protected externalListeners: ExternalListeners = {
        'upload-files-submission': this.handleUploadFilesSubmission,
        'open-sheet': this.handleOpenSheet,
        'window-destroyed': this.handleWindowDestroyed,
        'mouse-down-window-box': this.handleMouseDownWindowBox,
        'open-sheet-importer': this.handleOpenSheetImporter,
        'open-add-new-layer': this.handleOpenAddNewLayer,
        'click-open-history': this.handleOpenHistory,
        'new-layer-submit': this.handleNewLayerSubmit,
        'new-layer-mapped': this.handleNewLayerMapped,
        'layer-placement-made': this.handleLayerPlacementMade,
        'layer-active': this.handleLayerActive,
        'layer-visible-toggle': this.handleLayerVisibleToggle,
        'layer-delete': this.handleLayerDelete,
        'updated-view-coordinates': this.handleUpdateViewCoordinates,
        'window-update': this.handleWindowUpdate,
        'request-placement-deletion': this.handleRequestPlacementDeletion,
        'layer-order-up': this.handleLayerOrderUp,
    }

    protected async setup(): Promise<void> {
        this.userData = await userDataRepository.getAll()
        this.layers = await layerRepository.getAll()

        await sheetRepository.getAll()
        await placementImageRepository.getAll()

        for (const layer of this.layers) {
            for (const placement of layer.placements) {
                const placementImage = await placementImageRepository.getByUuid(placement.imageUuid)

                if (placementImage) {
                    const image = await Dom.image(placementImage.src)

                    loadedPlacementRepository.add({
                        uuid: placement.uuid,
                        layerUuid: layer.uuid,
                        image,
                        x: placement.coordinate.x,
                        y: placement.coordinate.y,
                        width: image.width,
                        height: image.height,
                    })
                }
            }
        }
    }

    protected build(): HTMLElement {
        const container = Dom.div()
        const sideMenu = Dom.makeComponent(SideMenu)
        const layerListing = Dom.makeComponent(LayerListing, { layers: this.layers })

        sideMenu.append(layerListing)

        const layerElements = this.layers.map(
            layer => Dom.makeComponent(CanvasLayer, { layer, userData: this.userData })
        )

        const tools = Dom.makeComponent(CanvasTools, { currentTool: this.userData.currentTool })

        container.append(
            sideMenu,
            tools,
            ...layerElements
        )

        return container
    }

    private handleUploadFilesSubmission(files: File[]): void {
        FileUpload.uploadMultiple(files)
    }

    private handleOpenSheet(sheetName: string): void {
        const sheet = sheetRepository.getByName(sheetName)
        if (this.openSheets.includes(sheet.name)) {
            this.windowBoxes[sheet.name].flash()
            return
        }
        const sheetViewerDataset = { imageSrc: sheet.imageSrc }
        const component = Dom.makeComponent(SheetViewer, sheetViewerDataset)

        const windowBox = WindowBoxFactory.make(component, sheet.name, {
            uuid: COMPONENT_UUIDS_CONSTRUCT_LOOKUP.get(SheetViewer)!,
            componentConfigration: { dataset: sheetViewerDataset },
            title: sheet.name,
        })

        if (windowBox) {
            this.openSheets.push(sheet.name)
            this.windowBoxes[sheet.name] = windowBox

            this.shadowRoot?.append(windowBox)
        }
    }

    private handleWindowDestroyed(name: string): void {
        if (this.openSheets.includes(name)) {
            this.openSheets = this.openSheets.filter(item => item !== name)
        }
        if (this.windowBoxes[name]) {
            delete this.windowBoxes[name]
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
            uuid: COMPONENT_UUIDS_CONSTRUCT_LOOKUP.get(SheetImporter)!,
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

    private handleNewLayerSubmit(input: LayerInput): void {
        const layer = Object.assign(
            LayerFactory.make(),
            input
        )

        Events.emit('new-layer-mapped', [layer])

        layerRepository.create(layer)
    }

    private handleNewLayerMapped(layers: Layer[]): void {
        this.shadowRoot?.append(
            ...layers
                .sort((a, b) => b.order - a.order)
                .map(layer => Dom.makeComponent(CanvasLayer, { layer }))
        )
    }

    private handleLayerPlacementMade(layer: Layer): void {
        layerRepository.update(layer)
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
                uuid: COMPONENT_UUIDS_CONSTRUCT_LOOKUP.get(PlacementHistory)!,
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
                layerRepository.update(layer)
                Events.emit('placement-removed', placementUuid)
                break
            }
        }
    }

    private async handleLayerOrderUp(layerUuid: string): Promise<void> {
        const layer = await layerRepository.getByUuid(layerUuid)
        const layers: Layer[] = await layerRepository.getAll()

        layers.sort((a, b) => a.order - b.order)

        const index = layers.findIndex(l => l.uuid === layer.uuid)

        if (index <= 0) return

        const above = layers[index - 1]

        const tempOrder = layer.order
        layer.order = above.order
        above.order = tempOrder

        await Promise.all([
            layerRepository.update(layer),
            layerRepository.update(above),
        ])
    }
}