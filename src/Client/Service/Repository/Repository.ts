export abstract class Repository {
    protected post(
        path: string,
        body: Array<Object> | Object,
    ): Promise<Response> {
        return fetch(path, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })
    }

    protected async get<T>(path: string): Promise<T> {
        const response = await fetch(path)

        return response.json()
    }
}