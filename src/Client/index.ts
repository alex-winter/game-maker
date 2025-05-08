import 'Client/styles.css'
import { COMPONENTS } from 'Client/Constants/components'
import { Events } from 'Client/Service/Events'
import { FileUpload } from 'Client/Service/FileUpload'
import { Dom } from 'Client/Service/Dom'
import { fileToBase64 } from 'Client/Service/fileToBase64'
import { WindowBox } from 'Client/Component/WindowBox/WindowBox'
import { WindowBoxFactory } from 'Client/Service/WindowBoxFactory'
import { SheetImporter } from 'Client/Component/SpriteSheets/SheetImporter/SheetImporter'
import { SheetMaker } from 'Client/Component/SpriteSheets/SheetMaker/SheetMaker'
import { EVENTS } from 'Client/Constants/events'
import { BasicModal } from 'Client/Component/Generic/Modal/BasicModal'
import { NewLayerForm } from 'Client/Component/NewLayerForm/NewLayerForm'
import { LayerInput } from 'Client/Model/LayerInput'
import { LayerFactory } from 'Model/Factory/LayerFactory'
import { LayerRepository } from 'Client/Service/Repository/LayerRepository'
import { Layer } from 'Model/Layer'
import { CanvasLayer } from 'Client/Component/Canvas/CanvasLayer'
import { SheetRepository } from 'Client/Service/Repository/SheetRepository'

COMPONENTS.forEach((tagName, constructor) => {
    customElements.define(tagName, constructor)
})

let openSheets: string[] = []

let windowBoxes: { [key: string]: WindowBox } = {}

const layerRepository = new LayerRepository()
const sheetRepository = new SheetRepository()

document.addEventListener('DOMContentLoaded', () => {
    Events.listenToFilesUploadSubmitted(files => {
        FileUpload.uploadMultiple(files)
    })

    Events.listenToOpenSheet(async file => {
        if (openSheets.includes(file.name)) {
            windowBoxes[file.name].flash()
            return
        }
        const component = Dom.makeComponent(SheetMaker, { imageSrc: await fileToBase64(file) })

        openSheets.push(file.name)

        windowBoxes[file.name] = WindowBoxFactory.make(component, file.name)
    })

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

    layerRepository.getAll().then(layers => {
        Events.emit(EVENTS.gotLayer, layers)
    })

    const getSheets = () => {
        sheetRepository.getAll().then(sheets => {
            console.log('got some sheets son')
            Events.emit(EVENTS.gotSheets, sheets)
        })
    }

    Events.listen(
        event => {
            getSheets()
        },
        EVENTS.getSheets
    )


    window.addEventListener('resize', () => Events.emit(EVENTS.windowResize))
})

