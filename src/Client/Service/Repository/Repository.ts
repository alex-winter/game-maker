type Body = Array<Object> | Object

export abstract class Repository {
    protected post(
        path: string,
        body: Body,
    ): Promise<Response> {
        return fetch(path, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })
    }

    protected patch(
        path: string,
        body: Body,
    ): Promise<Response> {
        return fetch(path, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
    }

    protected async get<T>(path: string): Promise<T> {
        const response = await fetch(path)

        return response.json()
    }
}