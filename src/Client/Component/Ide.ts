import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { WorldEditor } from './WorldEditor'

export class Ide extends Component {
    protected css(): string {
        return `
            :host {       
                display: block;
                width: 100%;
                height: 100vh; /* don't exceed the browser window height */
                box-sizing: border-box;
                overflow: hidden;
            }

            :host > .container {
                display: flex;
                flex-direction: column;
                height: 100%;
            }

            .menu {
                flex: none;
                background-color: grey;
                padding: 4px 8px;
            }

            .menu-bar {
                display: flex;
                align-items: center;
                gap: 12px;
                user-select: none;
            }

            .menu-item {
                padding: 6px 10px;
                border-radius: 4px;
                cursor: default;
            }

            .menu-item:hover {
                background: rgba(0,0,0,0.1);
            }

            .content {
                flex: 1 1 auto; /* take remaining space */
                min-height: 0;  /* allow proper overflow inside flex item */
                overflow: auto;
            }
        `           
    }

    protected build(): HTMLElement {
        const container = Dom.div()
        container.className = 'container'

        const menu = Dom.div()
        menu.className = 'menu'

        // top nav/menu bar with options
        const menuBar = Dom.div()
        menuBar.className = 'menu-bar'

        const menuItems = ['File', 'View', 'Settings']
        for (const name of menuItems) {
            const item = document.createElement('div')
            item.className = 'menu-item'
            item.textContent = name
            // attach simple click handlers if needed later
            // item.addEventListener('click', () => console.log(`${name} clicked`))
            menuBar.appendChild(item)
        }
        menu.appendChild(menuBar)

        const content = Dom.div()
        content.className = 'content'

        const gameMaker = Dom.makeComponent(WorldEditor) as unknown as Node

        content.appendChild(gameMaker)
        container.appendChild(menu)
        container.appendChild(content)

        return container
    }
}