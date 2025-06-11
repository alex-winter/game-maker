import { UserData } from 'Model/UserData'
import { config } from 'Server/config'
import { writeJson } from 'Server/services/write-json'
import { RequestHandler, Request, Response } from 'Server/types'

export const requestHandlerPatchUserData: RequestHandler = (request: Request, response: Response): void => {
    const body = request.body as UserData

    writeJson(
        config.userDataFileDir,
        body,
    )

    response.json({ ok: true })
}