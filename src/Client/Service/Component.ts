export abstract class Component extends HTMLElement {
    private readonly shadow: ShadowRoot
    public isSingleton: boolean = false
    private content!: HTMLElement

    constructor() {
        super()

        this.shadow = this.attachShadow({ mode: 'open' })
    }

    protected abstract build(): HTMLElement
    protected async setup(): Promise<void> { }
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

    private render(isReload: boolean = false) {
        this.setup().then(() => {
            const css = this.css().trim()

            if (css.length) {
                const sheet = new CSSStyleSheet()
                sheet.replaceSync(css)
                this.shadowRoot!.adoptedStyleSheets = [sheet]
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
    }
}