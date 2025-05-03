import { WindowBox } from 'Client/Component/WindowBox/WindowBox'
import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'

export class WindowBoxFactory {
    public static make(
        component: Component,
        title: string,
        isSingleton: boolean = false,
    ): WindowBoxFactory {
        const windowBox: WindowBox = Dom.makeComponent(WindowBox) as WindowBox

        if (isSingleton) {
            windowBox.dataset.isSingleton = 'true'
        }

        windowBox.dataset.title = title

        windowBox.append(component)

        if (!windowBox.isConnected) {
            document.body.append(
                windowBox
            )
        }

        return windowBox
    }
}