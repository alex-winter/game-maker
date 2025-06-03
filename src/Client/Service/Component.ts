import { Component as BaseComponent } from 'event-driven-web-components/dist/Component'

export type EventFn<T = any> = (event: CustomEvent<T>) => void

export type ExternalListeners = {
    [key: string]: EventFn
}

export type Listeners = {
    [key: string]: (event: any) => void
}

export abstract class Component extends BaseComponent {
    public isSingleton: boolean = false
    protected globalStylesheets: string[] = [
        '/dist/index.css'
    ]
}