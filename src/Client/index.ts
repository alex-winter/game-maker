import 'Client/styles.css'

import { COMPONENTS } from 'Client/Constants/components'
import { Events } from 'Client/Service/Events'
import { EVENTS } from 'Client/Constants/events'
import { App } from 'Client/Component/App'
import { Dom } from 'Client/Service/Dom'

for (const [constructor, tag] of COMPONENTS) {
    customElements.define(tag, constructor)
}

document.addEventListener('DOMContentLoaded', async () => {
    window.addEventListener('resize', () => Events.emit(EVENTS.windowResize))

    document.body.append(
        Dom.makeComponent(App)
    )
})

