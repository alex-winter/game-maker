
export abstract class HtmlElementTrait {
    public style!: CSSStyleDeclaration

    public getBoundingClientRect(): DOMRect {
        return new DOMRect
    }
}