import { SideMenu } from 'Client/Component/SideMenu/SideMenu'
import 'Client/styles.css'
import { LayerListing } from 'Client/Component/LayerListing/LayerListing'

document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.querySelector('canvas')
    const ctx = canvas?.getContext('2d')

    customElements.define('side-menu', SideMenu)
    customElements.define('layer-listing', LayerListing)
})