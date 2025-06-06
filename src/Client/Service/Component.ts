import { Component as BaseComponent } from 'event-driven-web-components/dist/Component'
import { Listeners as BaseListeners } from 'event-driven-web-components/dist/types/Listeners'
import { ExternalListeners as BaseExternalListeners } from 'event-driven-web-components/dist/types/ExternalListeners'
import { EventFn as BaseEventFn } from 'event-driven-web-components/dist/types/EventFn'

export type EventFn = BaseEventFn
export type ExternalListeners = BaseExternalListeners
export type Listeners = BaseListeners

export abstract class Component extends BaseComponent {
    public isSingleton: boolean = false

    protected get globalStylesheets(): string[] {
        return [
            '/dist/index.css'
        ]
    }
}