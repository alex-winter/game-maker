import { COMPONENTS } from 'Client/Constants/components'
import { Component } from 'Client/Service/Component'

export class Dom {
    constructor() {
        throw new Error('Can not construct')
    }

    public static div(...classList: string[]): HTMLDivElement {
        const element = document.createElement('div')

        if (classList.length) {
            element.classList.add(...classList)
        }

        return element
    }

    public static canvas(): HTMLCanvasElement {
        return document.createElement('canvas')
    }

    public static button(text: string, ...classList: string[]): HTMLButtonElement {
        const element = document.createElement('button')

        element.innerText = text

        if (classList.length) {
            element.classList.add(...classList)
        }

        return element
    }

    public static slot(): HTMLSlotElement {
        return document.createElement('slot')
    }

    public static multiFileInputWithDir(): HTMLInputElement {
        const element = document.createElement('input')

        element.type = 'file'
        element.webkitdirectory = true
        element.multiple = true

        return element
    }

    public static async image(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const image: HTMLImageElement = document.createElement('img')
            image.src = src
            image.addEventListener('load', () => resolve(image))
            image.addEventListener('abort', () => reject())
        })
    }

    public static component(
        component: CustomElementConstructor,
        dataset: Object = {},
    ): HTMLElement {
        const tag = this.findComponentTag(component)

        if ((component as unknown as typeof Component).isSingleton) {
            const existing = Dom.queryAllDeep(tag)
            if (existing.length) {
                return existing[0] as HTMLElement
            }
        }

        const element = document.createElement(tag)

        Object.assign(
            element.dataset,
            dataset
        )

        return element
    }

    public static getAllOfComponent<T = CustomElementConstructor>(component: CustomElementConstructor): T[] {
        const tag = this.findComponentTag(component)

        return Array.from(
            Dom.queryAllDeep(tag)
        ) as T[]
    }

    private static queryAllDeep(selector: string, root: ParentNode = document): Element[] {
        const result: Element[] = []

        const traverse = (node: Element): void => {
            if (node.matches(selector)) {
                result.push(node)
            }

            const shadow = (node as HTMLElement).shadowRoot
            if (shadow) {
                traverseAll(shadow)
            }

            Array.from(node.children).forEach(child => traverse(child as Element))
        }

        const traverseAll = (container: ParentNode): void => {
            Array.from(container.children).forEach(child => traverse(child as Element))
        }

        traverseAll(root)

        return result
    }

    private static findComponentTag(component: CustomElementConstructor): string {
        const tag = COMPONENTS.get(component)

        if (!tag) {
            throw new Error(`Component not found in COMPONENTS map: ${component.name}`)
        }

        return tag
    }
}