export abstract class Component extends HTMLElement {
    private readonly shadow: ShadowRoot

    public static readonly isSingleton: boolean = false

    constructor() {
        super()

        this.shadow = this.attachShadow({ mode: 'open' })
    }

    protected abstract build(): HTMLElement

    protected css(): string {
        return ''
    }

    protected async setup(): Promise<void> { }

    protected connectedCallback(): void {
        console.log('added to dom')
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

    disconnectedCallback() {
        console.log('Removed from DOM')
    }

    destory() {
        this.shadow.host.remove()
    }
}