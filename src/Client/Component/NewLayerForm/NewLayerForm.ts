import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'

export class NewLayerForm extends Component {

    private name: string = ''

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

        container.append(
            formGroup,
            submitButton,
        )

        return container
    }

    private handleSubmit(): void {
        console.log(this.name)
        Events.emit('new-layer-submit', { name: this.name })
    }
}
