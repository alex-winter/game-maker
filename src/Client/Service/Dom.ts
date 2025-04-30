import { COMPONENTS } from "Client/Constants/components"

export class Dom 
{
    constructor () {
        throw new Error('Can not construct')
    }

    public static div(...classList: string[]): HTMLDivElement
    {
        const element = document.createElement('div')

        if (classList.length) {
            element.classList.add(...classList)
        }

        return element
    }

    public static canvas(): HTMLCanvasElement
    {
        return document.createElement('canvas')
    }

    public static component(component: CustomElementConstructor): HTMLElement {
        const tag = COMPONENTS.get(component)
        
        if (!tag) {
            throw new Error(`Component not found in COMPONENTS map: ${component.name}`)
        }

        return document.createElement(tag)
    }
}