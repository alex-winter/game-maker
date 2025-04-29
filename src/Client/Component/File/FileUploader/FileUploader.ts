import { Component } from "Client/Service/Component";
import { Dom } from "Client/Service/Dom";

export class FileUploader extends Component {
    protected build(): HTMLElement {
        const container = Dom.div()

        container.innerText = 'File Upload'

        return container
    }
}