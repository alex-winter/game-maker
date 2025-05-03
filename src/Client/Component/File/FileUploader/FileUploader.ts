import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'

export class FileUploader extends Component {
    private readonly container: HTMLDivElement = Dom.div('uploader')

    public isSingleton: boolean = true

    protected css(): string {
        return /*css*/`
            :host {
                display: block;
                font-family: sans-serif;
            }

            .uploader {
                border: 2px dashed #ccc;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                transition: background-color 0.2s;
            }

            .uploader.dragover {
                background-color: #f0f0f0;
            }

            .upload-button {
                margin-top: 10px;
                display: inline-block;
                padding: 8px 16px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }

            input[type="file"] {
                display: none;
            }
        `
    }

    protected build(): HTMLElement {
        this.container.textContent = 'Drag & drop files here'

        this.container.addEventListener('dragover', this.handleDragOver.bind(this))
        this.container.addEventListener('dragleave', this.handleDragLeave.bind(this))
        this.container.addEventListener('drop', this.handleDragDrop.bind(this))

        const input = Dom.multiFileInputWithDir()

        input.addEventListener('change', () => {
            if (input.files) {
                this.handleFiles(input.files)
            }
        })

        const button = Dom.button('Select Files', 'upload-button')
        button.addEventListener('click', () => input.click())

        const wrapper = Dom.div()

        wrapper.append(
            this.container,
            button,
            input,
        )

        return wrapper
    }

    private handleDragOver(event: DragEvent): void {
        event.preventDefault()

        this.container.classList.add('dragover')
    }

    private handleDragLeave(event: DragEvent): void {
        this.container.classList.remove('dragover')
    }

    private handleDragDrop(event: DragEvent): void {
        event.preventDefault()

        this.container.classList.remove('dragover')

        if (event.dataTransfer?.files) {
            this.handleFiles(event.dataTransfer.files)
        }
    }

    private handleFiles(files: FileList): void {
        Events.emitFilesUploadSubmitted(
            Array.from(files)
        )
    }
}
