import 'Client/styles.css'
import { COMPONENTS } from 'Client/Constants/components'
import { Events } from 'Client/Service/Events'
import { FileUpload } from 'Client/Service/FileUpload'
import { Dom } from 'Client/Service/Dom'
import { SpriteMakerWindowBox } from 'Client/Component/WindowBox/SpriteMakerWindowBox'
import { fileToBase64 } from 'Client/Service/fileToBase64'
import { WindowBox } from 'Client/Component/WindowBox/WindowBox'
import { SpriteSheetsWindowBox } from 'Client/Component/WindowBox/SpriteSheetsWindowBox'

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
        document.body.append(
            Dom.component(SpriteMakerWindowBox, { imageSrc: await fileToBase64(file) })
        )
    })

    Events.listenMouseDownOnWindowBox(windowBox => {
        Dom.getAllOfComponent<WindowBox>(WindowBox).forEach(box => {
            box.zIndexMoveDown()
        })
        windowBox.zIndexMoveUp()
    })

    Events.listenToSheetImportOpen(() => {
        document.body.append(
            Dom.component(SpriteSheetsWindowBox)
        )
    })
})

