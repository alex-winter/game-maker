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

COMPONENTS.forEach((tagName, constructor) => {
    customElements.define(tagName, constructor)
})

let currentSelection: HTMLImageElement | null = null

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas')
    const ctx = canvas?.getContext('2d')

    canvas?.addEventListener('mousedown', (event: MouseEvent) => {
        ctx?.drawImage(
            currentSelection!,
            event.clientX,
            event.clientY,
        )

        const mouseMove = (event: MouseEvent) => {

        }

        const mouseUp = (event: MouseEvent) => {
            document.removeEventListener('mouseup', mouseUp)
            document.removeEventListener('mousemove', mouseMove)
        }

        document.addEventListener('mousemove', mouseMove)
        document.addEventListener('mouseup', mouseUp)
    })

    Events.listenToFilesUploadSubmitted(files => {
        FileUpload.uploadMultiple(files)
    })

    Events.listenToOpenSheet(async file => {
        const component = Dom.makeComponent(SheetMaker, { imageSrc: await fileToBase64(file) })

        WindowBoxFactory.make(component, 'Sheet Editor')
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

    Events.listen(EVENTS.openAddNewLayer, () => {
        const modal = Dom.makeComponent(BasicModal)
        const newLayerForm = Dom.makeComponent(NewLayerForm)

        modal.append(newLayerForm)

        document.body.append(
            modal
        )
    })

    Events.listen(EVENTS.sheetSelectionMade, (event) => {
        currentSelection = event.detail as HTMLImageElement
    })

    Events.listen(EVENTS.newLayerSubmit, (data) => {
        const input: LayerInput = data.detail as LayerInput

        const layer = Object.assign(
            LayerFactory.make(),
            input
        )

        Events.emit(EVENTS.newLayerMapped, layer)

        LayerRepository.persist(layer)
    })
})

