import 'Client/styles.css'

import { COMPONENTS } from 'Client/Constants/components'
import { Events } from 'Client/Service/Events'
import { Dom } from 'Client/Service/Dom'
import { Ide } from './Component/Ide'

for (const [constructor, tag] of COMPONENTS) {
    customElements.define(tag, constructor)
}

document.addEventListener('DOMContentLoaded', async () => {
    window.addEventListener('resize', () => Events.emit('window-resize', undefined))

    document.body.append(
        Dom.makeComponent(Ide)
    )
})

