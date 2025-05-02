export class FileUpload {
    public static async uploadMultiple(files: File[]): Promise<void> {
        const formData = new FormData()

        files.forEach((file) => {
            formData.append('files[]', file)
        })

        await fetch('/upload-files', {
            method: 'POST',
            body: formData,
        })
    }
}