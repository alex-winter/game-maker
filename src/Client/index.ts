import 'Client/styles.css'
import { COMPONENTS } from 'Client/Constants/components'
import { Events } from 'Client/Service/Events'
import { FileUpload } from 'Client/Service/FileUpload'
import { Dom } from 'Client/Service/Dom'
import { SpriteMakerWindowBox } from 'Client/Component/WindowBox/SpriteMakerWindowBox'

COMPONENTS.forEach((tagName, constructor) => {
    customElements.define(tagName, constructor)
})

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas')
    const ctx = canvas?.getContext('2d')
})

Events.listenToFilesUploadSubmitted(files => {
    FileUpload.uploadMultiple(files)
})

Events.listenToOpenSheet(file => {
    document.body.append(
        Dom.component(SpriteMakerWindowBox)
    )
})