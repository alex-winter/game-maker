import { Component } from "Client/Service/Component";
import { Dom } from "Client/Service/Dom";

export class FileUploader extends Component {
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
        `;
    }

    protected build(): HTMLElement {
        const container = Dom.div('uploader');
        container.textContent = "Drag & drop files here";

        // Handle drag over
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            container.classList.add('dragover');
        });

        // Handle drag leave
        container.addEventListener('dragleave', () => {
            container.classList.remove('dragover');
        });

        // Handle drop
        container.addEventListener('drop', (e: DragEvent) => {
            e.preventDefault();
            container.classList.remove('dragover');
            if (e.dataTransfer?.files) {
                this.handleFiles(e.dataTransfer.files);
            }
        });

        // Create hidden input for manual file selection
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;

        input.addEventListener('change', () => {
            if (input.files) {
                this.handleFiles(input.files);
            }
        });

        // Create button to trigger file input
        const button = Dom.div('upload-button');
        button.textContent = 'Select Files';
        button.addEventListener('click', () => input.click());

        const wrapper = Dom.div();
        wrapper.append(container, button, input);

        return wrapper;
    }

    private handleFiles(files: FileList) {
        // Handle files here
        console.log([...files]);
        // You could emit an event, upload, preview, etc.
    }
}
