import { hasAbleCreature } from '../domain/creature'
import { BattleRunner } from '../domain/encounter'

/**
 * The `BattleRunner` the field uses until the battle scene exists (T-056):
 * the party wins untouched when someone can stand, and runs away when no
 * one can. It never changes the party, so nothing here needs undoing.
 */
export const placeholderBattle: BattleRunner = request => ({
    outcome: hasAbleCreature(request.party) ? 'won' : 'fled',
    party: request.party,
})
