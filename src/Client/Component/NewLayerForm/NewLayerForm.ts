import { LAYERS } from 'Client/Constants/layers'
import { Component, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'

export class NewLayerForm extends Component {
    private name: string = ''
    private type: string = LAYERS.defaultType

    protected listeners: Listeners = {
        '.layer-name-input:keyup': this.handleNameChange,
        '.submit-button:click': this.handleSubmit,
        'select:change': this.handleSelectChange,
    }

    protected css(): string {
        return /*css*/`
            .form-container {
                font-family: 'Segoe UI', sans-serif;
                background: #fff;
                padding: 24px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                width: 100%;
                max-width: 400px;
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .form-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .form-label {
                font-weight: 600;
                color: #333;
                font-size: 14px;
            }

            .text-input, select {
                padding: 10px 12px;
                font-size: 14px;
                border-radius: 8px;
                border: 1px solid #ccc;
                background: #fdfdfd;
                transition: border 0.2s, box-shadow 0.2s;
            }

            .text-input:focus, select:focus {
                border-color: #007bff;
                box-shadow: 0 0 0 3px rgba(0,123,255,0.2);
                outline: none;
            }

            select {
                appearance: none;
                background-image: url('data:image/svg+xml;utf8,<svg fill="gray" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><polygon points="0,0 20,0 10,10"/></svg>');
                background-repeat: no-repeat;
                background-position: right 12px center;
                background-size: 10px;
            }

            .submit-button {
                padding: 12px 16px;
                border: none;
                background-color: #007bff;
                color: white;
                font-size: 15px;
                font-weight: 600;
                border-radius: 8px;
                cursor: pointer;
                transition: background-color 0.2s ease, transform 0.1s ease;
            }

            .submit-button:hover {
                background-color: #0056b3;
            }

            .submit-button:active {
                transform: scale(0.98);
            }
        `
    }

    protected build(): HTMLElement {
        const container = Dom.div('form-container')

        // Name field
        const nameGroup = Dom.div('form-group')
        const nameLabel = Dom.label('Layer Name', 'form-label')
        const nameInput = Dom.inputText('text-input', 'layer-name-input')
        nameInput.placeholder = 'e.g., Background Tiles'
        nameGroup.append(nameLabel, nameInput)

        // Type dropdown
        const typeGroup = Dom.div('form-group')
        const typeLabel = Dom.label('Layer Type', 'form-label')
        const typeSelect = document.createElement('select')
        typeSelect.className = 'text-input'

        LAYERS.types.forEach(type => {
            const option = document.createElement('option')
            option.value = type
            option.innerText = type.toUpperCase()
            typeSelect.appendChild(option)
        })

        typeGroup.append(typeLabel, typeSelect)

        // Submit button
        const submitButton = Dom.button('Create Layer', 'submit-button')

        container.append(
            nameGroup,
            typeGroup,
            submitButton,
        )

        return container
    }

    private handleSelectChange(event: Event): void {
        const select = event.target as HTMLSelectElement
        this.type = select.value
    }

    private handleNameChange(event: Event): void {
        const input = event.target as HTMLInputElement
        this.name = input.value
    }

    private handleSubmit(): void {
        Events.emit('close-modal', this)
        Events.emit('new-layer-submit', {
            name: this.name,
            type: this.type,
        })
    }
}
