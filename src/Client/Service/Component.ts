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
    private externalHandlers: Array<{
        key: string
        handler: EventListener
    }> = []
    private attachedListeners: Array<{
        element: Element
        type: string
        handler: EventListener
    }> = []

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
                this.setListeners()
                this.setExternalListners()
                this.afterBuild()
            })
    }

    protected afterPatch() {
    }

    protected patch(): void {
        const firstChild = Array.from(this.shadow.children)
            .filter(child => child.tagName !== 'LINK')

        if (firstChild.length > 1) {
            throw new Error('there should only be one root child of the shadow dom')
        }

        patchDOM(firstChild[0], this.build())

        this.setListeners()
        this.setExternalListners()

        this.afterPatch()
    }

    protected setListeners(): void {
        // Step 1: Remove previous listeners
        this.attachedListeners.forEach(({ element, type, handler }) => {
            element.removeEventListener(type, handler)
        })
        this.attachedListeners = []

        // Step 2: Attach new listeners and store references
        Object.entries(this.listeners).forEach(([key, eventFn]) => {
            const [selector, eventType] = key.split(':')
            this.findAll(selector).forEach(element => {
                const boundHandler = eventFn.bind(this)
                element.addEventListener(eventType, boundHandler)
                this.attachedListeners.push({ element, type: eventType, handler: boundHandler })
            })
        })
    }

    protected setExternalListners(): void {
        // Unbind old handlers
        this.externalHandlers.forEach(({ key, handler }) => {
            Events.unlisten(handler, key)
        })
        this.externalHandlers = []

        const listeners = (this as any).externalListners as ExternalListeners | undefined
        if (listeners) {
            Object.entries(listeners).forEach(([key, listener]) => {
                const boundHandler = listener.bind(this) as EventListener
                Events.listen(boundHandler, key)
                this.externalHandlers.push({ key, handler: boundHandler })
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