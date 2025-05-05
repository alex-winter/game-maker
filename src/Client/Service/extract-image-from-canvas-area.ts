import { Dom } from 'Client/Service/Dom'

export async function extractImageFromCanvasArea(
    sourceCanvas: HTMLCanvasElement,
    x: number,
    y: number,
    width: number,
    height: number,
): Promise<HTMLImageElement> {
    const tempCanvas = Dom.canvas()

    tempCanvas.width = width
    tempCanvas.height = height

    const ctx = tempCanvas.getContext('2d')!

    const image = await Dom.image(sourceCanvas.toDataURL())

    ctx.drawImage(image, x, y, width, height, 0, 0, width, height)


    console.log(await Dom.image(tempCanvas.toDataURL()))


    return await Dom.image(tempCanvas.toDataURL())
}