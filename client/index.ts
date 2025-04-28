import { SideMenu } from 'components/SideMenu/SideMenu'
import 'styles.css'

document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.querySelector('canvas')
    const ctx = canvas?.getContext('2d')

    customElements.define('side-menu', SideMenu)
})