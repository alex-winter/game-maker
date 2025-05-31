import 'Client/styles.css'

import { COMPONENT_UUID_LOOKUP, COMPONENT_UUIDS_CONSTRUCT_LOOKUP, COMPONENTS } from 'Client/Constants/components'
import { Events } from 'Client/Service/Events'
import { FileUpload } from 'Client/Service/FileUpload'
import { Dom } from 'Client/Service/Dom'
import { WindowBox } from 'Client/Component/WindowBox/WindowBox'
import { WindowBoxFactory } from 'Client/Service/WindowBoxFactory'
import { SheetImporter } from 'Client/Component/SpriteSheets/SheetImporter/SheetImporter'
import { SheetViewer } from 'Client/Component/SpriteSheets/SheetViewer/SheetViewer'
import { EVENTS } from 'Client/Constants/events'
import { BasicModal } from 'Client/Component/Generic/Modal/BasicModal'
import { NewLayerForm } from 'Client/Component/NewLayerForm/NewLayerForm'
import { LayerInput } from 'Client/Model/LayerInput'
import { LayerFactory } from 'Model/Factory/LayerFactory'
import { layerRepository } from 'Client/Service/Repository/LayerRepository'
import { Layer } from 'Model/Layer'
import { CanvasLayer } from 'Client/Component/Canvas/CanvasLayer'
import { sheetRepository } from 'Client/Service/Repository/SheetRepository'
import { placementImageRepository } from 'Client/Service/Repository/PlacementImageRepository'
import { WindowConfiguration } from 'Model/UserData'
import { Coordinates } from 'Model/Coordinates'
import { CanvasTools } from 'Client/Component/Canvas/CanvasTools'
import { PlacementHistory } from 'Client/Component/PlacementHistory/PlacementHistory'
import { loadedPlacementRepository } from 'Client/Service/Repository/LoadedPlacement'
import { userDataRepository } from 'Client/Service/Repository/UserDataRepository'
import { SideMenu } from 'Client/Component/SideMenu/SideMenu'
import { LayerListing } from 'Client/Component/LayerListing/LayerListing'

COMPONENTS.forEach((tagName, constructor) => {
    customElements.define(tagName, constructor)
})

let openSheets: string[] = []

let windowBoxes: { [key: string]: WindowBox } = {}

document.addEventListener('DOMContentLoaded', async () => {
    const userData = await userDataRepository.getAll()
    const layers = await layerRepository.getAll()
    const sheets = await sheetRepository.getAll()
    const placementImages = await placementImageRepository.getAll()

    await new Promise(resolve => {
        if (layers.length === 0) {
            resolve(null)
        }
        layers.forEach((layer, layerIndex) => {
            layer.placements.forEach(async (placement, placementIndex) => {
                const placementImage = await placementImageRepository.getByUuid(
                    placement.imageUuid
                )

                if (placementImage) {
                    const image = await Dom.image(
                        placementImage.src
                    )

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

                if (layerIndex === layers.length - 1 && placementIndex === layer.placements.length - 1) {
                    resolve(null)
                }
            })

            if (layerIndex === layers.length - 1 && layer.placements.length === 0) {
                resolve(null)
            }
        })
    })


    Events.listenToFilesUploadSubmitted(files => {
        FileUpload.uploadMultiple(files)
    })

    Events.listenToOpenSheet(async sheetName => {
        const sheet = sheetRepository.getByName(sheetName)
        if (openSheets.includes(sheet.name)) {
            windowBoxes[sheet.name].flash()
            return
        }
        const sheetViewerDataset = { imageSrc: sheet.imageSrc }
        const component = Dom.makeComponent(SheetViewer, sheetViewerDataset)

        openSheets.push(sheet.name)

        windowBoxes[sheet.name] = WindowBoxFactory.make(component, sheet.name, {
            uuid: COMPONENT_UUIDS_CONSTRUCT_LOOKUP.get(SheetViewer)!,
            componentConfigration: { dataset: sheetViewerDataset },
            title: sheet.name,
        })
    })

    Events.listen(event => {
        const name = event.detail as string
        if (openSheets.includes(name)) {
            openSheets = openSheets.filter(item => item !== name)
        }
        if (windowBoxes[name]) {
            delete windowBoxes[name]
        }
    }, 'window-destroyed')

    Events.listenMouseDownOnWindowBox(windowBox => {
        Dom.getAllOfComponent<WindowBox>(WindowBox).forEach(box => {
            box.zIndexMoveDown()
        })
        windowBox.zIndexMoveUp()
    })

    Events.listenToSheetImportOpen(() => {
        const component = Dom.makeComponent(SheetImporter)

        WindowBoxFactory.make(component, 'Import Sheets', {
            uuid: COMPONENT_UUIDS_CONSTRUCT_LOOKUP.get(SheetImporter)!,
            componentConfigration: { dataset: {} },
            title: 'Import Sheets',
        })
    })

    Events.listen(() => {
        const modal = Dom.makeComponent(BasicModal)
        const newLayerForm = Dom.makeComponent(NewLayerForm)

        modal.append(newLayerForm)

        document.body.append(
            modal
        )
    }, EVENTS.openAddNewLayer)

    Events.listen((event) => {
        const input: LayerInput = event.detail as LayerInput

        const layer = Object.assign(
            LayerFactory.make(),
            input
        )

        Events.emit(EVENTS.newLayerMapped, [layer])

        layerRepository.persist(layer)
    }, EVENTS.newLayerSubmit)

    Events.listen(
        event => {
            document.body.append(
                ...(event.detail as Layer[])
                    .sort((a, b) => b.order - a.order)
                    .map(layer => Dom.makeComponent(CanvasLayer, { layer }))
            )
        },
        EVENTS.gotLayer,
        EVENTS.newLayerMapped,
    )

    Events.listen(
        event => {
            layerRepository.update(event.detail as Layer)
        },
        'layer-placement-made',
    )

    Events.listen(
        event => {
            layerRepository.setActive((event.detail as Layer).uuid)
        },
        'layer-active',
    )

    Events.listen(
        event => {
            layerRepository.toggleVisible((event.detail as Layer).uuid)
        },
        'layer-visible-toggle',
    )

    Events.listen(
        event => {
            layerRepository.update(event.detail as Layer)
        },
        'layer-update',
    )

    Events.listen(
        event => {
            const uuid = event.detail as string

            layerRepository.remove(uuid)
                .then(() => {
                    Events.emit('layer-deleted', uuid)
                })
        },
        'layer-delete'
    )

    Events.listen(
        async event => {
            const corrdinates = event.detail as Coordinates
            const userData = await userDataRepository.getAll()

            userData.lastViewPosition.x = corrdinates.x
            userData.lastViewPosition.y = corrdinates.y

            userDataRepository.persist(userData)
        },
        'updated-view-coordinates',
    )

    Events.listen(
        async event => {
            const windowConfiguration = event.detail as WindowConfiguration

            const userData = await userDataRepository.getAll()

            userData.windows[windowConfiguration.uuid] = windowConfiguration

            userDataRepository.persist(userData)
        },
        'window-update',
    )

    Events.listen(
        event => {
            WindowBoxFactory.make(
                Dom.makeComponent(PlacementHistory),
                'Placement History',
                {
                    uuid: COMPONENT_UUIDS_CONSTRUCT_LOOKUP.get(PlacementHistory)!,
                    componentConfigration: { dataset: {} },
                    title: 'Placement History',
                }
            )
        },
        'click-open-history'
    )

    Events.listen(
        async event => {
            const placementUuid = event.detail as string
            const layers = await layerRepository.getAll()

            loadedPlacementRepository.removeByUuid(placementUuid)

            for (const layer of layers) {
                const index = layer.placements.findIndex(p => p.uuid === placementUuid)
                if (index !== -1) {
                    layer.placements.splice(index, 1)
                    layerRepository.update(layer)

                    Events.emit('layer-update', layer)
                    break
                }
            }

        },
        'request-placement-deletion'
    )

    window.addEventListener('resize', () => Events.emit(EVENTS.windowResize))

    const sideMenu = Dom.makeComponent(SideMenu)
    const layerListing = Dom.makeComponent(LayerListing, { layers })

    sideMenu.append(layerListing)

    const layerElements = layers.map(layer => Dom.makeComponent(CanvasLayer, { layer, userData }))

    // Object.entries(userData.windows).forEach(([componentUuid, windowConfiguration]) => {
    //     WindowBoxFactory.make(
    //         Dom.makeComponent(
    //             COMPONENT_UUID_LOOKUP.get(componentUuid)!,
    //             windowConfiguration.componentConfigration.dataset
    //         ),
    //         windowConfiguration.title,
    //         windowConfiguration,
    //     )
    // })

    const tools = Dom.makeComponent(CanvasTools, { currentTool: userData.currentTool })

    document.body.append(
        sideMenu,
        tools,
        ...layerElements
    )
})

