import { SideMenu } from 'Client/Component/SideMenu/SideMenu'
import 'Client/styles.css'
import { LayerListing } from 'Client/Component/LayerListing/LayerListing'
import { WindowBox } from './Component/WindowBox/WindowBox'
import { FileUploader } from './Component/File/FileUploader/FileUploader'
import { FileListing } from './Component/File/FileListing/FileListing'

document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.querySelector('canvas')
    const ctx = canvas?.getContext('2d')

    customElements.define('side-menu', SideMenu)
    customElements.define('layer-listing', LayerListing)
    customElements.define('window-box', WindowBox)
    customElements.define('file-uploader', FileUploader)
    customElements.define('file-listing', FileListing)
})