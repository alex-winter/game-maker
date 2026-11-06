import { Component, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'

/**
 * A yes/no question inside `BasicModal`. Emits `confirmed` (the dataset's
 * `topic` string) when the destructive button is pressed, then closes.
 */
export class ConfirmDialog extends Component<{ topic: string; message: string; confirmLabel: string }> {
    protected listeners: Listeners = {
        '.confirm:click': this.handleConfirm,
        '.cancel:click': this.close,
    }

    protected css(): string {
        return /*css*/`
            .dialog {
                background: #fff;
                padding: 24px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                max-width: 360px;
                display: flex;
                flex-direction: column;
                gap: 20px;
                font-family: 'Segoe UI', sans-serif;
            }

            .message {
                font-size: 15px;
                color: #333;
            }

            .actions {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }

            button {
                padding: 10px 16px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                cursor: pointer;
            }

            .cancel {
                background: #eee;
                color: #333;
            }

            .confirm {
                background: #e74c3c;
                color: white;
            }
        `
    }

    protected build(): HTMLElement {
        const dialog = Dom.div('dialog')
        const actions = Dom.div('actions')

        actions.append(Dom.button('Cancel', 'cancel'), Dom.button(this.parsedDataset.confirmLabel, 'confirm'))
        dialog.append(Dom.span(this.parsedDataset.message, 'message'), actions)

        return dialog
    }

    private handleConfirm(): void {
        Events.emit('confirmed', this.parsedDataset.topic)
        this.close()
    }

    private close(): void {
        Events.emit('close-modal', this)
    }
}
