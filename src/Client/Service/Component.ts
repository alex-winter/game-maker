export abstract class Component extends HTMLElement {
    private readonly shadow: ShadowRoot
    public isSingleton: boolean = false

    constructor() {
        super()

        this.shadow = this.attachShadow({ mode: 'open' })
    }

    protected abstract build(): HTMLElement
    protected async setup(): Promise<void> { }
    protected css(): string {
        return ''
    }

    public destory() {
        this.shadow.host.remove()
    }

    protected connectedCallback(): void {
        this.setup().then(() => {
            const css = this.css().trim()

            if (css.length) {
                const style = document.createElement('style')
                style.innerText = css
                this.shadow.appendChild(style)
            }

            this.shadow.appendChild(
                this.build()
            )
        })
    }
}