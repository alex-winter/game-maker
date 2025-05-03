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

COMPONENTS.forEach((tagName, constructor) => {
    customElements.define(tagName, constructor)
})

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas')
    const ctx = canvas?.getContext('2d')



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
        document.body.append(
            Dom.makeComponent(BasicModal)
        )
    })
})

