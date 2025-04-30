import { Component } from "Client/Service/Component";

export class SpriteMakerWindowBox extends Component
{
    protected build(): HTMLElement {
        const windowBox = document.createElement('window-box')
        const spriteMaker = document.createElement('sprite-maker')

        windowBox.dataset.title = 'Sprite Sheets'

        windowBox.append(
            spriteMaker,
        )

        return windowBox
    }
}