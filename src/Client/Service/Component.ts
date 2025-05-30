import { Events } from 'Client/Service/Events'
import { isJSON } from 'Client/Service/is-json'
import { patchDOM } from 'Client/Service/patch-dom'

export type EventFn<T = any> = (event: CustomEvent<T>) => void

export type ExternalListeners = {
    [key: string]: EventFn
}

export type Listeners = {
    [key: string]: (event: any) => void
}

export abstract class Component extends HTMLElement {
    private readonly shadow: ShadowRoot
    public isSingleton: boolean = false
    protected readonly parameters: { [key: string]: any } = {}
    protected readonly listeners: Listeners = {}
    protected readonly externalListerners: ExternalListeners = {}

    constructor() {
        super()

        this.shadow = this.attachShadow({ mode: 'open' })
    }

    protected abstract build(): HTMLElement
    protected async setup(): Promise<void> { }
    protected afterBuild(): void { }
    protected css(): string {
        return ''
    }

    public destroy() {
        this.shadow.host.remove()
    }

    protected connectedCallback(): void {
        this.setExternalListners()
        this.setListeners()

        Object.entries(this.dataset).forEach(([key, value]) => {
            this.parameters[key] = isJSON(value)
                ? JSON.parse(value)
                : value
        })

        this.setup()
            .then(() => {
                const css = this.css().trim()

                const link = document.createElement('link')

                link.rel = 'stylesheet'
                link.href = '/dist/index.css'

                this.shadow.append(link)

                if (css.length) {
                    const sheet = new CSSStyleSheet()
                    sheet.replaceSync(css)
                    this.shadow.adoptedStyleSheets = [sheet]
                }

                this.shadow.appendChild(
                    this.build()
                )
            })
            .then(() => {
                this.afterBuild()
            })
    }

    protected patch(): void {
        const firstChild = Array.from(this.shadow.children)
            .filter(child => child.tagName !== 'LINK')

        if (firstChild.length > 1) {
            throw new Error('there should only be one root child of the shadow dom')
        }

        patchDOM(firstChild[0], this.build())

        this.setListeners()
    }

    protected setListeners(): void {
        Object.entries(this.listeners).forEach(([key, eventFn]) => {
            const [selector, eventType] = key.split(':')
            this.findAll(selector).forEach(element => {
                element.addEventListener(eventType, eventFn)
            })
        })
    }

    protected setExternalListners(): void {
        const listeners = (this as any).externalListners as ExternalListeners | undefined
        if (listeners) {
            Object.entries(listeners).forEach(([key, listener]) => {
                Events.listen(listener.bind(this), key)
            })
        }
    }

    protected findOne<T = HTMLElement>(query: string): T | null {
        return this.shadow.querySelector(query) as T | null
    }

    protected findAll<T = HTMLElement[]>(query: string): T {
        return Array.from(
            this.shadow.querySelectorAll(query)
        ) as T
    }
}