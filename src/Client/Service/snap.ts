export const snap = (size: number) => (value: number): number => {
    return Math.floor(
        Math.floor(value / size) * size
    )
}