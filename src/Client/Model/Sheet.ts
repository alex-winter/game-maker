export type Sheet = {
    /** The lookup key: the generated file id, never the display name. */
    id: string

    /** The name the user uploaded. Two sheets may share it. */
    name: string

    file: string

    /** A URL under `/assets/`, never a data URL. */
    imageSrc: string
}
