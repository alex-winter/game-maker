import { isJSON } from 'Client/Service/is-json'
import { patchDOM } from 'Client/Service/patch-dom'

export abstract class Component extends HTMLElement {
    private readonly shadow: ShadowRoot
    public isSingleton: boolean = false
    private content!: HTMLElement
    protected readonly parameters: { [key: string]: any } = {}

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

    public reload() {
        this.render(true)
    }

    protected connectedCallback(): void {
        this.render()
    }

    protected patch(): void {
        const firstChild = Array.from(this.shadow.children)
            .filter(child => child.tagName !== 'LINK')[0]

        if (firstChild) {
            patchDOM(firstChild, this.build())
        }
    }

    private render(isReload: boolean = false) {
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

                this.content = this.build()

                if (isReload) {
                    this.shadow.replaceChild(
                        this.build(),
                        this.content,
                    )
                } else {
                    this.shadow.appendChild(
                        this.content
                    )
                }
            })
            .then(() => {
                this.afterBuild()
            })
    }

    protected findOne(query: string): HTMLElement | null {
        return this.shadow.querySelector(query)
    }
}