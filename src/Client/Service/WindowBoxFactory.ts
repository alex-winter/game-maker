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
    ): WindowBox | null {
        const windowBox: WindowBox = Dom.makeComponent(WindowBox, { configuration }) as WindowBox

        if (component.isSingleton && singletonInstances.includes(component)) {
            return windowBox
        }

        if (!windowBox.isConnected) {
            windowBox.dataset.title = title

            if (configuration.rect) {
                windowBox.style.width = configuration.rect.width
                windowBox.style.height = configuration.rect.height
                windowBox.style.top = configuration.rect.top
                windowBox.style.left = configuration.rect.left
            }

            windowBox.append(component)

            if (component.isSingleton) {
                singletonInstances.push(component)
            }

            return windowBox
        }

        return null
    }
}