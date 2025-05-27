import { Component, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { Events } from 'Client/Service/Events'

export class FileUploader extends Component {
    public isSingleton: boolean = true

    protected listeners: Listeners = {
        '.uploader:dragover': this.handleDragOver,
        '.file-input:change': this.handleInputChange,
        '.upload-button:click': this.handleUploadButtonClick,
    }

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
        const container = Dom.div('uploader')
        container.textContent = 'Drag & drop files here'

        container.addEventListener('dragleave', this.handleDragLeave.bind(this))
        container.addEventListener('drop', this.handleDragDrop.bind(this))

        const input = Dom.multiFileInput('file-input')
        const button = Dom.button('Select Files', 'upload-button')
        const wrapper = Dom.div()

        wrapper.append(
            container,
            button,
            input,
        )

        return wrapper
    }

    private getContainer(): HTMLDivElement {
        return this.findOne('.uploader')!
    }

    private handleUploadButtonClick(event: Event): void {
        const input = this.findOne('.file-input') as HTMLInputElement

        input.click()
    }

    private handleInputChange(event: Event): void {
        const input = event.target as HTMLInputElement

        if (input.files) {
            this.handleFiles(input.files)
        }
    }

    private handleDragOver(event: DragEvent): void {
        event.preventDefault()

        this.getContainer().classList.add('dragover')
    }

    private handleDragLeave(event: DragEvent): void {
        this.getContainer().classList.remove('dragover')
    }

    private handleDragDrop(event: DragEvent): void {
        event.preventDefault()

        this.getContainer().classList.remove('dragover')

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
