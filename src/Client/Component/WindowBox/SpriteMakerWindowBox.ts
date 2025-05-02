import { SpriteMaker } from 'Client/Component/Canvas/SpriteMaker/SpriteMaker'
import { WindowBox } from 'Client/Component/WindowBox/WindowBox'
import { Component } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'

export class SpriteMakerWindowBox extends Component {
    protected build(): HTMLElement {
        const windowBox = Dom.component(WindowBox)
        const spriteMaker = Dom.component(SpriteMaker)
        const testImage = document.createElement('img')

        testImage.src = this.dataset.imageSrc as string

        windowBox.dataset.title = 'Sprite Maker'

        windowBox.append(
            spriteMaker,
            testImage,
        )

        return windowBox
    }
}