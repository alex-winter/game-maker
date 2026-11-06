import { isMoveInput, isSpeciesInput, isStarter, Move, Species } from 'domain/creature'
import { newId } from 'domain/id'
import { addMove, addSpecies, findMove, findSpecies, removeMove, removeSpecies, withMove, withSpecies, withStarter, withTypeChart } from 'domain/project'
import { isTypeChart, withMoveDefaults } from 'domain/battle-data'
import { readProject, writeProject } from 'Server/services/project-store'
import { Request, RequestHandler, Response } from 'Server/types'

const INVALID_SPECIES = 'A species needs a name, one or two types, six whole base stats, and a learnset'

const INVALID_MOVE = 'A move needs a name, whole power and accuracy (0–100), a type, and a damage class of physical or special'

function cleanedSpecies(body: Omit<Species, 'id'>, id: string): Species {
    return {
        id,
        name: body.name.trim(),
        types: body.types.map(type => type.trim().toLowerCase()),
        baseStats: body.baseStats,
        learnset: [...body.learnset].sort((a, b) => a.level - b.level),
    }
}

function cleanedMove(body: Omit<Move, 'id' | 'damageClass'> & Partial<Pick<Move, 'damageClass'>>, id: string): Move {
    return withMoveDefaults({ id, name: body.name.trim(), power: body.power, accuracy: body.accuracy, type: body.type.trim().toLowerCase(), damageClass: body.damageClass })
}

/** Body: a species without an id. Answers the stored species with its new id. */
export const requestHandlerPostSpecies: RequestHandler = (request: Request, response: Response): void => {
    const body: unknown = request.body

    if (!isSpeciesInput(body)) {
        response.status(400).json({ error: INVALID_SPECIES })
        return
    }

    const species = cleanedSpecies(body, newId())

    writeProject(addSpecies(readProject(), species))

    response.json(species)
}

export const requestHandlerPutSpecies: RequestHandler = (request: Request, response: Response): void => {
    const { speciesId } = request.params
    const body: unknown = request.body

    if (!isSpeciesInput(body)) {
        response.status(400).json({ error: INVALID_SPECIES })
        return
    }

    const project = readProject()

    if (findSpecies(project, speciesId) === undefined) {
        response.status(404).json({ error: 'Species not found' })
        return
    }

    const species = cleanedSpecies(body, speciesId)

    writeProject(withSpecies(project, species))

    response.json(species)
}

export const requestHandlerDeleteSpecies: RequestHandler = (request: Request, response: Response): void => {
    const { speciesId } = request.params
    const project = readProject()

    if (findSpecies(project, speciesId) === undefined) {
        response.status(404).json({ error: 'Species not found' })
        return
    }

    writeProject(removeSpecies(project, speciesId))

    response.json({ ok: true })
}

/** Body: a move without an id. Answers the stored move with its new id. */
export const requestHandlerPostMoves: RequestHandler = (request: Request, response: Response): void => {
    const body: unknown = request.body

    if (!isMoveInput(body)) {
        response.status(400).json({ error: INVALID_MOVE })
        return
    }

    const move = cleanedMove(body, newId())

    writeProject(addMove(readProject(), move))

    response.json(move)
}

export const requestHandlerPutMove: RequestHandler = (request: Request, response: Response): void => {
    const { moveId } = request.params
    const body: unknown = request.body

    if (!isMoveInput(body)) {
        response.status(400).json({ error: INVALID_MOVE })
        return
    }

    const project = readProject()

    if (findMove(project, moveId) === undefined) {
        response.status(404).json({ error: 'Move not found' })
        return
    }

    const move = cleanedMove(body, moveId)

    writeProject(withMove(project, move))

    response.json(move)
}

export const requestHandlerDeleteMove: RequestHandler = (request: Request, response: Response): void => {
    const { moveId } = request.params
    const project = readProject()

    if (findMove(project, moveId) === undefined) {
        response.status(404).json({ error: 'Move not found' })
        return
    }

    writeProject(removeMove(project, moveId))

    response.json({ ok: true })
}

/** Body: `{ typeChart }` — attacking type to defending type to one of ×0, ×0.5, ×1, ×2 (T-052). Answers the stored chart. */
export const requestHandlerPutTypeChart: RequestHandler = (request: Request, response: Response): void => {
    const body: unknown = request.body
    const typeChart: unknown = body !== null && typeof body === 'object' && 'typeChart' in body ? (body as { typeChart: unknown }).typeChart : body

    if (!isTypeChart(typeChart)) {
        response.status(400).json({ error: 'A type chart maps attacking type to defending type to 0, 0.5, 1, or 2' })
        return
    }

    writeProject(withTypeChart(readProject(), typeChart))

    response.json({ typeChart })
}

/** Body: `{ speciesId, level }` or `null` to clear. Answers the stored starter. */
export const requestHandlerPutStarter: RequestHandler = (request: Request, response: Response): void => {
    const body: unknown = request.body
    const starter: unknown = body !== null && typeof body === 'object' && 'starter' in body ? (body as { starter: unknown }).starter : body

    if (starter !== null && !isStarter(starter)) {
        response.status(400).json({ error: 'A starter is { speciesId, level 1–100 } or null' })
        return
    }

    const project = readProject()

    if (starter !== null && findSpecies(project, starter.speciesId) === undefined) {
        response.status(404).json({ error: 'Species not found' })
        return
    }

    writeProject(withStarter(project, starter))

    response.json({ starter })
}
