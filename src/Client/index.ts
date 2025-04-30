import 'Client/styles.css'
import { COMPONENTS } from 'Client/Constants/components'

COMPONENTS.forEach((tagName, constructor) => {
    customElements.define(tagName, constructor)
})

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas')
    const ctx = canvas?.getContext('2d')
})