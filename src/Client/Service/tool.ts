/** The editor's paint tools. All of them write metatile ids onto the active tile layer. */
export type Tool = 'pencil' | 'fill' | 'rect' | 'rubber'

export function isTool(value: string): value is Tool {
    return value === 'pencil' || value === 'fill' || value === 'rect' || value === 'rubber'
}
