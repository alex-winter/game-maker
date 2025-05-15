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

    public static label(text: string, ...classList: string[]): HTMLLabelElement {
        const element = document.createElement('label')

        element.innerText = text

        if (classList.length) {
            element.classList.add(...classList)
        }

        return element
    }

    public static inputText(...classList: string[]): HTMLInputElement {
        const element = document.createElement('input')

        element.type = 'text'

        return element
    }

    public static canvas(width: number = 0, height: number = 0): HTMLCanvasElement {
        const element = document.createElement('canvas')

        element.width = width
        element.height = height

        return element
    }

    public static button(text: string = '', ...classList: string[]): HTMLButtonElement {
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

    public static multiFileInput(): HTMLInputElement {
        const element = document.createElement('input')

        element.type = 'file'
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

    public static i(...classList: string[]): HTMLElement {
        const element = document.createElement('i')

        element.classList.add(...classList)

        return element
    }

    public static makeComponent(
        component: CustomElementConstructor,
        dataset: { [key: string]: string | any[] | Object } = {},
    ): Component {
        const tag = this.findComponentTag(component)
        const existing = Dom.queryAllDeep(tag)

        if (existing.length) {
            const found = existing[0] as Component
            if (found.isSingleton) {
                return found
            }
        }

        const element = document.createElement(tag)

        Object.entries(dataset).forEach(([key, value]) => {
            if (value instanceof Object || Array.isArray(value)) {
                dataset[key] = JSON.stringify(value)
            }
        })

        Object.assign(
            element.dataset,
            dataset
        )

        return element as Component
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