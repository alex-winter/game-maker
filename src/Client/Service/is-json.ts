function isJSON(value: any): value is string {
    if (typeof value !== 'string') {
        return false
    }

    try {
        const parsed = JSON.parse(value)

        return typeof parsed === 'object' && parsed !== null
    } catch {
        return false
    }
}