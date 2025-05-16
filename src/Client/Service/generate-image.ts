import { RGBA } from 'Client/Model/RGB'

export function generateImageDataURL(
    width: number,
    height: number,
    color: RGBA
): string {
    const canvas: HTMLCanvasElement = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')
    if (!ctx) throw new Error('Unable to get canvas context')

    ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`
    ctx.fillRect(0, 0, width, height)

    const dataURL: string = canvas.toDataURL('image/png')

    return dataURL
}