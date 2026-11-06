import { EventCallback, Events } from 'Client/Service/Events'
import { parseDataset } from 'Client/Service/parse-dataset'

/**
 * Method-style signatures are bivariant in their parameter, so a handler
 * declared as `(event: MouseEvent) => void` can sit in a map typed for
 * `Event`. The alternative is a cast at every call site.
 */
type Bivariant<P> = { handle(payload: P): void }['handle']

/** `'selector:eventType'` → handler, attached to every match inside the shadow root. */
export type Listeners = { readonly [selectorAndEvent: string]: Bivariant<Event> }

/** Bus event name → handler. Bound to the component and removed when it disconnects. */
export type ExternalListeners = { readonly [eventName: string]: Bivariant<never> }

export type EventFn<T extends Event = Event> = (event: T) => void

type AttachedListener = {
    readonly element: Element

    readonly type: string

    readonly handler: EventListener
}

type AttachedExternal = {
    readonly key: string

    readonly handler: EventCallback<unknown>
}

/**
 * The element base every view extends. Lifecycle on first connect: load the
 * global stylesheets, `setup()`, adopt `css()`, append `build()`, bind
 * `listeners` and `externalListeners`, `afterBuild()`. `patch()` rebuilds the
 * tree and rebinds the local listeners. Disconnecting removes the bus listeners.
 *
 * `TDataset` is the shape `Dom.makeComponent` was given for this element.
 */
export abstract class Component<TDataset = {}> extends HTMLElement {
    /** When true, `Dom.makeComponent` returns the connected instance instead of a new one. */
    public isSingleton: boolean = false

    protected readonly listeners: Listeners = {}

    protected readonly externalListeners: ExternalListeners = {}

    private built = false
    private patching = false
    private patchAgain = false
    private attachedListeners: AttachedListener[] = []
    private attachedExternal: AttachedExternal[] = []

    public constructor() {
        super()
        this.attachShadow({ mode: 'open' })
    }

    protected get shadow(): ShadowRoot {
        const root = this.shadowRoot

        if (root === null) {
            throw new Error('Component shadow root is missing')
        }

        return root
    }

    protected get globalStylesheets(): readonly string[] {
        return ['/dist/index.css']
    }

    /** The dataset as `Dom.makeComponent` passed it, with JSON values decoded. */
    protected get parsedDataset(): TDataset {
        return parseDataset(this.dataset) as TDataset
    }

    protected async setup(): Promise<void> {
        // nothing by default
    }

    protected abstract build(): HTMLElement

    protected css(): string {
        return ''
    }

    protected afterBuild(): void {
        // nothing by default
    }

    protected connectedCallback(): void {
        if (!this.isConnected) {
            return
        }

        if (this.built) {
            this.bindExternalListeners()
            return
        }

        void this.firstConnect()
    }

    protected disconnectedCallback(): void {
        this.unbindExternalListeners()
    }

    /**
     * Replaces the built tree with a fresh `build()` and rebinds local
     * listeners. Removing the old tree can blur a focused input, whose
     * `change` handler may patch again; that nested call is deferred so the
     * first replace finishes on a tree that is still attached.
     */
    protected patch(): void {
        if (this.patching) {
            this.patchAgain = true
            return
        }

        const root = this.rootElement()

        if (root === undefined) {
            return
        }

        this.patching = true

        try {
            root.replaceWith(this.build())
            this.bindListeners()
        } finally {
            this.patching = false
        }

        if (this.patchAgain) {
            this.patchAgain = false
            this.patch()
        }
    }

    public findOne<T extends HTMLElement = HTMLElement>(query: string): T | null {
        return this.shadow.querySelector<T>(query)
    }

    public findAll<T extends HTMLElement = HTMLElement>(query: string): T[] {
        return Array.from(this.shadow.querySelectorAll<T>(query))
    }

    private async firstConnect(): Promise<void> {
        this.built = true

        await this.loadGlobalStylesheets()
        await this.setup()

        const cssText = this.css().trim()

        if (cssText.length > 0) {
            const sheet = new CSSStyleSheet()

            sheet.replaceSync(cssText)
            this.shadow.adoptedStyleSheets = [sheet]
        }

        this.shadow.append(this.build())

        this.bindListeners()
        this.bindExternalListeners()
        this.afterBuild()
    }

    /** The one non-link child of the shadow root: what `build()` returned. */
    private rootElement(): Element | undefined {
        return Array.from(this.shadow.children).find(child => child.tagName !== 'LINK')
    }

    private loadGlobalStylesheets(): Promise<void[]> {
        return Promise.all(
            this.globalStylesheets.map(href => new Promise<void>(resolve => {
                const link = document.createElement('link')

                link.rel = 'stylesheet'
                link.href = href
                link.onload = () => resolve()
                // a missing stylesheet must not stop the element from building
                link.onerror = () => resolve()

                this.shadow.append(link)
            })),
        )
    }

    private bindListeners(): void {
        for (const attached of this.attachedListeners) {
            attached.element.removeEventListener(attached.type, attached.handler)
        }

        this.attachedListeners = []

        for (const [key, handler] of Object.entries(this.listeners)) {
            const separator = key.lastIndexOf(':')
            const selector = key.slice(0, separator)
            const type = key.slice(separator + 1)
            const bound: EventListener = handler.bind(this)

            for (const element of this.findAll(selector)) {
                element.addEventListener(type, bound)
                this.attachedListeners.push({ element, type, handler: bound })
            }
        }
    }

    private bindExternalListeners(): void {
        this.unbindExternalListeners()

        for (const [key, handler] of Object.entries(this.externalListeners)) {
            const bound = (handler as EventCallback<unknown>).bind(this)

            Events.listen(key, bound)
            this.attachedExternal.push({ key, handler: bound })
        }
    }

    private unbindExternalListeners(): void {
        for (const attached of this.attachedExternal) {
            Events.unlisten(attached.key, attached.handler)
        }

        this.attachedExternal = []
    }
}
