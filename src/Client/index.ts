import 'Client/styles.css'

import { COMPONENTS } from 'Client/Constants/components'
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
import { LayerRepository } from 'Client/Service/Repository/LayerRepository'
import { Layer } from 'Model/Layer'
import { CanvasLayer } from 'Client/Component/Canvas/CanvasLayer'
import { SheetRepository } from 'Client/Service/Repository/SheetRepository'
import { placementImageRepository } from 'Client/Service/Repository/PlacementImageRepository'
import { UserDataRepsitory } from 'Client/Service/Repository/UserDataRepository'
import { UserData } from 'Model/UserData'
import { Coordinates } from 'Model/Coordinates'

COMPONENTS.forEach((tagName, constructor) => {
    customElements.define(tagName, constructor)
})

let openSheets: string[] = []

let windowBoxes: { [key: string]: WindowBox } = {}

const layerRepository = new LayerRepository()
const sheetRepository = new SheetRepository()
const userDataRepository = new UserDataRepsitory()

document.addEventListener('DOMContentLoaded', () => {
    layerRepository.getAll().then(layers => {
        Events.emit(EVENTS.gotLayer, layers)
    })

    placementImageRepository.getAll()

    const getSheets = () => {
        sheetRepository.getAll().then(sheets => {
            Events.emit(EVENTS.gotSheets, sheets)
        })
    }

    userDataRepository.getAll()

    Events.listen(async event => {
        Events.emit('got-user-data', await userDataRepository.getAll())
    }, 'built-canvas-layer')

    Events.listenToFilesUploadSubmitted(files => {
        FileUpload.uploadMultiple(files)
    })

    Events.listenToOpenSheet(async sheet => {
        if (openSheets.includes(sheet.name)) {
            windowBoxes[sheet.name].flash()
            return
        }
        const component = Dom.makeComponent(SheetViewer, { imageSrc: sheet.imageSrc })

        openSheets.push(sheet.name)

        windowBoxes[sheet.name] = WindowBoxFactory.make(component, sheet.name)
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

        WindowBoxFactory.make(component, 'Import Sheets')
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
                ...(event.detail as Layer[]).map(layer => Dom.makeComponent(CanvasLayer, { layer }))
            )
        },
        EVENTS.gotLayer,
        EVENTS.newLayerMapped,
    )

    Events.listen(
        event => {
            layerRepository.update(event.detail as Layer)
        },
        EVENTS.layerPlacementMade,
    )

    Events.listen(
        event => {
            console.log('heard event for layer active')
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
            console.log('index heard update')
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
        event => {
            getSheets()
        },
        EVENTS.getSheets
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


    window.addEventListener('resize', () => Events.emit(EVENTS.windowResize))
})

