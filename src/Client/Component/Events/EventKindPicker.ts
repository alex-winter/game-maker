import { Component, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'
import { Cell } from 'domain/coordinates'

/** The kinds an author can place by clicking an empty cell. Items and NPCs arrive with T-038 and T-042. */
export type PlaceableKind = 'warp' | 'sign'

export type EventKindPick = { readonly kind: PlaceableKind; readonly cell: Cell }

export const EVENT_KIND_PICK = 'event-kind-pick'

/** Asks which event to put on an empty cell. Emits `event-kind-pick` and closes. */
export class EventKindPicker extends Component<{ cell: Cell }> {
    protected listeners: Listeners = {
        '.pick-warp:click': () => this.pick('warp'),
        '.pick-sign:click': () => this.pick('sign'),
    }

    protected css(): string {
        return /*css*/`
            .picker {
                font-family: 'Segoe UI', sans-serif;
                background: #fff;
                padding: 24px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                width: 320px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            h3 {
                margin: 0;
                font-size: 16px;
                color: #333;
            }

            button {
                display: flex;
                align-items: center;
                gap: 12px;
                text-align: left;
                padding: 12px 14px;
                border-radius: 8px;
                border: 1px solid #ccc;
                background: #fff;
                font: inherit;
                cursor: pointer;
            }

            button:hover {
                background: #f0f0f0;
            }

            .letter {
                width: 28px;
                height: 28px;
                border-radius: 6px;
                color: #fff;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .pick-warp .letter {
                background: #8e44ad;
            }

            .pick-sign .letter {
                background: #d4a017;
            }

            .description {
                display: flex;
                flex-direction: column;
            }

            .description small {
                color: #666;
            }
        `
    }

    protected build(): HTMLElement {
        const picker = Dom.div('picker')
        const { cell } = this.parsedDataset
        const title = document.createElement('h3')

        title.textContent = `Place on ${cell.x}, ${cell.y}`
        picker.append(
            title,
            this.option('pick-warp', 'W', 'Warp', 'Stepping here moves the player to another cell or map.'),
            this.option('pick-sign', 'S', 'Sign', 'Facing it and pressing the interact key shows a dialog.'),
        )

        return picker
    }

    private option(className: string, letter: string, name: string, detail: string): HTMLElement {
        const button = Dom.button('', className)
        const description = Dom.div('description')
        const small = document.createElement('small')

        small.textContent = detail
        description.append(Dom.span(name), small)
        button.append(Dom.span(letter, 'letter'), description)

        return button
    }

    private pick(kind: PlaceableKind): void {
        Events.emit('close-modal', this)
        Events.emit<EventKindPick>(EVENT_KIND_PICK, { kind, cell: this.parsedDataset.cell })
    }
}
