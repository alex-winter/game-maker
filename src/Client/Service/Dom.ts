import { COMPONENTS } from 'Client/Constants/components'
import { Component } from 'Client/Service/Component'

export type ComponentConstructor<T extends Component<unknown> = Component<unknown>> = new () => T

export class Dom {
    constructor() {
        throw new Error('Can not construct')
    }

    public static addClasses(element: HTMLElement, ...classList: string[]): void {
        if (classList.length) {
            element.classList.add(...classList)
        }
    }

    public static div(...classList: string[]): HTMLDivElement {
        const element = document.createElement('div')

        this.addClasses(element, ...classList)

        return element
    }

    public static label(text: string, ...classList: string[]): HTMLLabelElement {
        const element = document.createElement('label')

        element.innerText = text

        this.addClasses(element, ...classList)

        return element
    }

    public static span(text: string, ...classList: string[]): HTMLSpanElement {
        const element = document.createElement('span')

        element.innerText = text

        this.addClasses(element, ...classList)

        return element
    }

    public static inputText(...classList: string[]): HTMLInputElement {
        const element = document.createElement('input')

        element.type = 'text'

        this.addClasses(element, ...classList)

        return element
    }

    public static inputTextArea(...classList: string[]): HTMLTextAreaElement {
        const element = document.createElement('textarea')

        this.addClasses(element, ...classList)

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

        this.addClasses(element, ...classList)

        return element
    }

    public static slot(): HTMLSlotElement {
        return document.createElement('slot')
    }

    public static multiFileInput(...classList: string[]): HTMLInputElement {
        const element = document.createElement('input')

        element.type = 'file'
        element.multiple = true

        this.addClasses(element, ...classList)

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

        this.addClasses(element, ...classList)

        return element
    }

    /**
     * Creates the element registered for `component` and encodes `dataset`
     * onto it: strings as they are, everything else as JSON. A connected
     * singleton is returned instead of a second instance.
     */
    public static makeComponent<T extends Component<unknown>>(
        component: ComponentConstructor<T>,
        dataset: { readonly [key: string]: unknown } = {},
    ): T {
        const tag = this.findComponentTag(component)
        const existing = Dom.queryAllDeep(tag)
        const found = existing[0]

        if (found instanceof component && found.isSingleton) {
            return found
        }

        const element = document.createElement(tag)

        if (!(element instanceof component)) {
            throw new Error(`Tag ${tag} is not registered as ${component.name}`)
        }

        for (const [key, value] of Object.entries(dataset)) {
            element.dataset[key] = typeof value === 'string' ? value : JSON.stringify(value)
        }

        return element
    }

    public static getAllOfComponent<T extends Component<unknown>>(component: ComponentConstructor<T>): T[] {
        const tag = this.findComponentTag(component)

        return Dom.queryAllDeep(tag).filter((element): element is T => element instanceof component)
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

    private static findComponentTag(component: ComponentConstructor): string {
        const tag = COMPONENTS.get(component)

        if (!tag) {
            throw new Error(`Component not found in COMPONENTS map: ${component.name}`)
        }

        return tag
    }
}