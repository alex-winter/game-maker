import { WindowBox } from 'Client/Component/WindowBox/WindowBox'
import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { WindowConfiguration } from 'Model/UserData'

const singletonInstances: Component[] = []

export class WindowBoxFactory {
    public static make(
        component: Component,
        title: string,
        configuration: WindowConfiguration
    ): WindowBox {
        const windowBox: WindowBox = Dom.makeComponent(WindowBox, { configuration }) as WindowBox

        if (component.isSingleton && singletonInstances.includes(component)) {
            return windowBox
        }

        if (!windowBox.isConnected) {
            windowBox.dataset.title = title

            if (configuration.rect) {
                windowBox.style.width = configuration.rect.width + 'px'
                windowBox.style.height = configuration.rect.height + 'px'
                windowBox.style.top = configuration.rect.y + 'px'
                windowBox.style.left = configuration.rect.x + 'px'
            }

            windowBox.append(component)

            if (component.isSingleton) {
                singletonInstances.push(component)
            }

            document.body.append(
                windowBox
            )
        }

        return windowBox
    }
}