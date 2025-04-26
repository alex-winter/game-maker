export abstract class Component extends HTMLElement
{
    private readonly shadow: ShadowRoot

    protected constructor () {
        super()

        this.shadow = this.attachShadow({mode: 'open'})
    }

    protected abstract build(): HTMLElement

    protected connectedCallback(): void 
    {
        this.shadow.appendChild(
            this.build()
        )
    }
}