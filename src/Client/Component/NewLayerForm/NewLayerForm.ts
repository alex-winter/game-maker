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
                font-family: sans-serif;
                width: 100%;
            }

            .form-group {
                margin-bottom: 1rem;
            }

            .form-label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 600;
                color: #333;
            }

            .text-input {
                width: 100%;
                padding: 0.5rem;
                font-size: 1rem;
                border: 1px solid #ccc;
                border-radius: 4px;
                outline: none;
            }

            .text-input:focus {
                border-color: #007bff;
                box-shadow: 0 0 0 2px rgba(0,123,255,0.2);
            }
        `
    }

    protected build(): HTMLElement {
        const container = Dom.div('form-container')
        const formGroup = Dom.div('form-group')

        const label = Dom.label('Layer Name', 'form-label')
        const input = Dom.inputText('text-input', 'layer-name-input')
        input.placeholder = 'Enter layer name'

        const submitButton = Dom.button('Save', 'submit-button')

        formGroup.appendChild(label)
        formGroup.appendChild(input)

        const layerTypeOptions = document.createElement('select')

        LAYERS.types.forEach(type => {
            const option = document.createElement('option')
            option.value = type
            option.innerText = type.toUpperCase()
            layerTypeOptions.append(option)
        })

        container.append(
            formGroup,
            layerTypeOptions,
            submitButton,
        )

        return container
    }

    private handleSelectChange(event: Event): void {
        const layerTypeOptions = event.target as HTMLSelectElement

        this.type = layerTypeOptions.value
    }

    private handleNameChange(event: Event): void {
        const input = event.target as HTMLInputElement

        this.name = input.value
    }

    private handleSubmit(): void {
        Events.emit('close-modal', this)
        Events.emit(
            'new-layer-submit',
            {
                name: this.name,
                type: this.type,
            }
        )
    }
}
