import { WindowBox } from 'Client/Component/WindowBox/WindowBox'
import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'

const singletonInstances: Component[] = []

export class WindowBoxFactory {
    public static make(
        component: Component,
        title: string,
    ): void {
        if (component.isSingleton && singletonInstances.includes(component)) {
            return
        }

        const windowBox: WindowBox = Dom.makeComponent(WindowBox) as WindowBox

        if (!windowBox.isConnected) {
            windowBox.dataset.title = title

            windowBox.append(component)

            if (component.isSingleton) {
                singletonInstances.push(component)
            }

            document.body.append(
                windowBox
            )
        }
    }
}