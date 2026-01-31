import { Component } from "Client/Service/Component"
import { Dom } from "Client/Service/Dom"

class DialogCreator extends Component {
    
    protected build(): HTMLElement {
        const container = Dom.div()

        const textArea = Dom.inputTextArea()
        textArea.placeholder = "Enter dialog text..."
        container.append(textArea)

        const repliesLabel = Dom.label("Replies:")
        container.append(repliesLabel)

        const repliesContainer = Dom.div()
        repliesContainer.className = "replies-container"
        container.append(repliesContainer)

        const addReplyButton = Dom.button("Add Reply")
        addReplyButton.onclick = () => {
            const replyInput = Dom.inputTextArea()
            replyInput.placeholder = "Enter reply text..."
            replyInput.className = "reply-input"
            repliesContainer.append(replyInput)
        }
        container.append(addReplyButton)

        return container
    }
    
}

export { DialogCreator }