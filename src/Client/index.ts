import { SideMenu } from 'Client/Component/SideMenu/SideMenu'
import 'Client/styles.css'
import { LayerListing } from 'Client/Component/LayerListing/LayerListing'
import { WindowBox } from './Component/WindowBox/WindowBox'

document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.querySelector('canvas')
    const ctx = canvas?.getContext('2d')

    customElements.define('side-menu', SideMenu)
    customElements.define('layer-listing', LayerListing)
    customElements.define('window-box', WindowBox)
})