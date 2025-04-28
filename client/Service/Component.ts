export abstract class Component extends HTMLElement
{
    private readonly shadow: ShadowRoot

    constructor () {
        super()

        this.shadow = this.attachShadow({mode: 'open'})
    }

    protected abstract build(): HTMLElement
    
    protected css(): string
    {
        return ''
    }

    protected connectedCallback(): void 
    {
        const css = this.css().trim()

        if (css.length) {
            const style = document.createElement('style')
            style.innerText = css
            this.shadow.appendChild(style)
        }

        this.shadow.appendChild(
            this.build()
        )
    }
}