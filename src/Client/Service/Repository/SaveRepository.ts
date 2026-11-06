import { Repository } from 'Client/Service/Repository/Repository'
import { parseSave, SavedSession } from 'domain/save'

/** The one save slot on the server. */
class SaveRepository extends Repository {
    /** The saved session, or undefined when there is none or it does not parse. */
    public async load(): Promise<SavedSession | undefined> {
        const response = await fetch('/save')

        if (!response.ok) {
            return undefined
        }

        const parsed = parseSave(await response.json())

        return parsed.ok ? parsed.session : undefined
    }

    public async save(session: SavedSession): Promise<void> {
        await this.put('/save', session)
    }

    public async forget(): Promise<void> {
        await this.delete('/save')
    }
}

export const saveRepository = new SaveRepository()
