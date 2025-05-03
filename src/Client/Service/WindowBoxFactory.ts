import { WindowBox } from 'Client/Component/WindowBox/WindowBox'
import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'

export class WindowBoxFactory {
    public static make(
        component: Component,
        title: string,
        isSingleton: boolean = false,
    ): void {
        const windowBox: WindowBox = Dom.makeComponent(WindowBox) as WindowBox

        if (!windowBox.isConnected) {

            if (isSingleton) {
                windowBox.dataset.isSingleton = 'true'
            }

            windowBox.dataset.title = title

            windowBox.append(component)

            document.body.append(
                windowBox
            )
        }
    }
}