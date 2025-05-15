import { EVENTS } from 'Client/Constants/events'
import { LAYERS } from 'Client/Constants/layers'
import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'

export class NewLayerForm extends Component {

    private name: string = ''
    private type: string = LAYERS.defaultType

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
        const input = Dom.inputText('text-input')
        input.placeholder = 'Enter layer name'
        input.addEventListener('keyup', () => this.name = input.value)

        const submitButton = Dom.button('Save')
        submitButton.addEventListener('click', this.handleSubmit.bind(this))

        formGroup.appendChild(label)
        formGroup.appendChild(input)

        const layerTypeOptions = document.createElement('select')

        LAYERS.types.forEach(type => {
            const option = document.createElement('option')
            option.value = type
            option.innerText = type.toUpperCase()
            layerTypeOptions.append(option)
        })

        layerTypeOptions.addEventListener('change', () => {
            this.type = layerTypeOptions.value
        })

        container.append(
            formGroup,
            layerTypeOptions,
            submitButton,
        )

        return container
    }

    private handleSubmit(): void {
        Events.emit(
            EVENTS.closeModal,
            this
        )
        Events.emit(
            EVENTS.newLayerSubmit,
            {
                name: this.name,
                type: this.type,
            }
        )
    }
}
