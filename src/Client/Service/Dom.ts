export class Dom 
{
    constructor () {
        throw new Error('Can not construct')
    }

    public static div(...classList: string[]): HTMLDivElement
    {
        const element = document.createElement('div')

        if (classList.length) {
            element.classList.add(...classList)
        }

        return element
    }
}