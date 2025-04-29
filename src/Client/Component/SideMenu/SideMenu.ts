import { Dom } from "Client/Service/Dom";
import { Component } from "Client/Service/Component";

export class SideMenu extends Component
{
    protected css(): string {
        return /*css*/`
            :host {
                background-color: whitesmoke;
                position: fixed;
                left: 0;
                right: 0;
                height: 100vh;
                width: 200px;
            }
        `
    }

    protected build(): HTMLElement {
        const container = Dom.div()
        const slot = document.createElement('slot')

        container.append(slot)

        return container
    }

}