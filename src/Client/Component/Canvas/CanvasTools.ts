import { Component, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { isTool, Tool } from 'Client/Service/tool'

const TOOLS: ReadonlyArray<{ tool: Tool; icon: string; title: string }> = [
    { tool: 'pencil', icon: 'fa-pencil', title: 'Pencil' },
    { tool: 'fill', icon: 'fa-fill-drip', title: 'Fill' },
    { tool: 'rect', icon: 'fa-vector-square', title: 'Rectangle' },
    { tool: 'rubber', icon: 'fa-eraser', title: 'Eraser' },
]

/** The tool bar. Emits `tool-selection` with the tool name; `MapCanvas` listens. */
export class CanvasTools extends Component<{ currentTool: string }> {
    private currentTool: Tool = 'pencil'
    public isSingleton: boolean = true

    protected readonly listeners: Listeners = {
        'button:click': this.handleToolClick,
    }

    protected css(): string {
        return /*css*/`
            :host {
                position: fixed;
                display: block;
                padding: 10px;
                border-radius: 4px;
                background-color: whitesmoke;
                top: 50px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 800;
            }

            .container {
                display: flex;
                gap: 10px;
            }

            button {
                padding: 10px;
                flex: 1;
                border: 4px solid whitesmoke;
                cursor: pointer;
            }

            button.active {
                border-color: black;
            }

            i {
                pointer-events: none;
            }
        `
    }

    protected async setup(): Promise<void> {
        const saved = this.parsedDataset.currentTool

        if (isTool(saved)) {
            this.currentTool = saved
        }
    }

    protected build(): HTMLElement {
        const container = Dom.div('container')

        for (const { tool, icon, title } of TOOLS) {
            const button = Dom.button('', tool + '-button')

            button.dataset.tool = tool
            button.title = title
            button.append(Dom.i('fa-solid', icon))
            button.classList.toggle('active', this.currentTool === tool)

            container.append(button)
        }

        return container
    }

    private handleToolClick(event: Event): void {
        const tool = event.target instanceof HTMLButtonElement ? event.target.dataset.tool : undefined

        if (tool === undefined || !isTool(tool)) {
            return
        }

        this.currentTool = tool
        Events.emit('tool-selection', tool)
        this.patch()
    }
}
