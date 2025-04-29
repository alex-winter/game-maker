export class Dom 
{
    constructor () {
        throw new Error('Can not construct')
    }

    public static div(...classList: string[]): HTMLDivElement
    {
        const element = document.createElement('div')

        element.classList.add(...classList)

        return element
    }
}