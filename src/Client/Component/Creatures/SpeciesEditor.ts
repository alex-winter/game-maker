import { Component, Listeners } from 'Client/Service/Component'
import { Dom } from 'Client/Service/Dom'
import { projectRepository } from 'Client/Service/Repository/ProjectRepository'
import { BaseStats, DEFAULT_BASE_STATS, MAX_LEVEL, MIN_LEVEL, Move, Species, Starter, STAT_NAMES } from 'domain/creature'
import { DAMAGE_CLASSES, isDamageClass, matchup, MULTIPLIERS, TypeChart, withMatchup } from 'domain/battle-data'
import { typeNames } from 'domain/project'
import { Id } from 'domain/id'

const STAT_LABELS: { readonly [K in keyof BaseStats]: string } = {
    hp: 'HP',
    attack: 'Atk',
    defense: 'Def',
    specialAttack: 'SpA',
    specialDefense: 'SpD',
    speed: 'Spe',
}

/**
 * The project's creatures (T-047): a list of species with a form for the
 * selected one — name, one or two types, six base stats, a learnset of
 * (level, move) rows — the minimal move catalog the learnsets refer to, and
 * which species at which level a new game hands the player.
 */
export class SpeciesEditor extends Component {
    private species: Species[] = []
    private moves: Move[] = []
    private starter: Starter | null = null
    private typeChart: TypeChart = {}
    private types: string[] = []
    private selectedId: Id | undefined

    protected listeners: Listeners = {
        '.species-select:change': this.handleSelect,
        '.new-species:click': this.handleNewSpecies,
        '.delete-species:click': this.handleDeleteSpecies,
        '.species-form input:change': this.handleSpeciesChange,
        '.species-form select:change': this.handleSpeciesChange,
        '.add-learn:click': this.handleAddLearn,
        '.remove-learn:click': this.handleRemoveLearn,
        '.new-move:click': this.handleNewMove,
        '.move-row input:change': this.handleMoveChange,
        '.move-row select:change': this.handleMoveChange,
        '.matchup:change': this.handleMatchupChange,
        '.new-type:click': this.handleNewType,
        '.delete-move:click': this.handleDeleteMove,
        '.starter-species:change': this.handleStarterChange,
        '.starter-level:change': this.handleStarterChange,
    }

    protected css(): string {
        return /*css*/`
            :host {
                display: block;
                font-family: 'Segoe UI', sans-serif;
                font-size: 13px;
                color: #333;
                min-width: 560px;
            }

            .toolbar, .row {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .toolbar {
                padding-bottom: 8px;
                border-bottom: 1px solid #ddd;
                margin-bottom: 8px;
            }

            input, select, button {
                font: inherit;
            }

            input, select {
                padding: 4px 6px;
                border-radius: 6px;
                border: 1px solid #ccc;
            }

            input[type=number] {
                width: 60px;
            }

            button {
                padding: 4px 10px;
                border-radius: 6px;
                border: 1px solid #ccc;
                background: #fff;
                cursor: pointer;
            }

            button:hover {
                background: #f0f0f0;
            }

            h4 {
                margin: 14px 0 6px;
                font-size: 13px;
                color: #555;
                text-transform: uppercase;
                letter-spacing: 0.04em;
            }

            .species-form {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .stats {
                display: flex;
                gap: 6px;
            }

            .stat {
                display: flex;
                flex-direction: column;
                gap: 2px;
                font-size: 11px;
                color: #666;
            }

            .learn-row, .move-row {
                display: flex;
                gap: 6px;
                align-items: center;
            }

            .learn-row .level {
                width: 54px;
            }

            .move-name {
                width: 120px;
            }

            .move-type {
                width: 80px;
            }

            .chart {
                border-collapse: collapse;
                font-size: 12px;
            }

            .chart th, .chart td {
                padding: 2px 4px;
                text-align: center;
            }

            .chart th {
                font-weight: 600;
                color: #555;
            }

            .chart th.attacking {
                text-align: right;
            }

            .chart select {
                padding: 2px 4px;
                font-size: 12px;
            }

            .chart select.x0 { color: #999; }
            .chart select.x05 { color: #c0392b; }
            .chart select.x2 { color: #27ae60; font-weight: 600; }

            .hint, .empty {
                color: #666;
            }

            .empty {
                padding: 12px 0;
            }

            .starter {
                margin-top: 14px;
                padding-top: 8px;
                border-top: 1px solid #ddd;
            }
        `
    }

    protected async setup(): Promise<void> {
        await this.reload()

        this.selectedId = this.species[0]?.id
    }

    protected build(): HTMLElement {
        const container = Dom.div('species-editor')

        container.append(this.buildToolbar())

        const selected = this.selected()

        if (selected === undefined) {
            const empty = Dom.div('empty')

            empty.textContent = 'No species yet. Add one to give the player a starter.'
            container.append(empty)
        } else {
            container.append(this.buildSpeciesForm(selected))
        }

        container.append(this.buildMoves(), this.buildTypeChart(), this.buildStarter())

        return container
    }

    private buildToolbar(): HTMLElement {
        const toolbar = Dom.div('toolbar')
        const select = document.createElement('select')

        select.className = 'species-select'
        select.disabled = this.species.length === 0

        for (const species of this.species) {
            const option = document.createElement('option')

            option.value = species.id
            option.textContent = species.name
            option.selected = species.id === this.selectedId
            select.append(option)
        }

        const remove = Dom.button('Delete', 'delete-species')

        remove.disabled = this.selected() === undefined
        toolbar.append(select, Dom.button('+ Species', 'new-species'), remove)

        return toolbar
    }

    private buildSpeciesForm(species: Species): HTMLElement {
        const form = Dom.div('species-form')
        const nameRow = Dom.div('row')
        const name = Dom.inputText('species-name')
        const typeOne = Dom.inputText('type-one')
        const typeTwo = Dom.inputText('type-two')

        name.value = species.name
        name.placeholder = 'Name'
        typeOne.value = species.types[0] ?? ''
        typeOne.placeholder = 'type'
        typeTwo.value = species.types[1] ?? ''
        typeTwo.placeholder = 'second type (optional)'
        nameRow.append(Dom.label('Name', 'hint'), name, Dom.label('Types', 'hint'), typeOne, typeTwo)

        const stats = Dom.div('stats')

        for (const stat of STAT_NAMES) {
            const box = Dom.div('stat')
            const input = document.createElement('input')

            input.type = 'number'
            input.min = '0'
            input.step = '1'
            input.className = 'stat-' + stat
            input.value = String(species.baseStats[stat])
            box.append(Dom.span(STAT_LABELS[stat]), input)
            stats.append(box)
        }

        const learnTitle = document.createElement('h4')

        learnTitle.textContent = 'Learnset'

        const learnset = Dom.div('learnset')

        for (const [index, entry] of species.learnset.entries()) {
            const row = Dom.div('learn-row')
            const level = document.createElement('input')
            const move = this.moveSelect('learn-move', entry.moveId)
            const remove = Dom.button('×', 'remove-learn')

            level.type = 'number'
            level.min = String(MIN_LEVEL)
            level.max = String(MAX_LEVEL)
            level.className = 'level'
            level.value = String(entry.level)
            level.dataset.index = String(index)
            move.dataset.index = String(index)
            remove.dataset.index = String(index)
            row.append(Dom.span('Lv', 'hint'), level, move, remove)
            learnset.append(row)
        }

        const addLearn = Dom.button('+ Learn a move', 'add-learn')

        addLearn.disabled = this.moves.length === 0
        addLearn.title = this.moves.length === 0 ? 'Add a move to the catalog below first' : ''

        form.append(nameRow, stats, learnTitle, learnset, addLearn)

        return form
    }

    private moveSelect(className: string, selectedId: Id): HTMLSelectElement {
        const select = document.createElement('select')

        select.className = className

        for (const move of this.moves) {
            const option = document.createElement('option')

            option.value = move.id
            option.textContent = move.name
            option.selected = move.id === selectedId
            select.append(option)
        }

        if (!this.moves.some(move => move.id === selectedId)) {
            const option = document.createElement('option')

            option.value = selectedId
            option.textContent = '(missing move)'
            option.selected = true
            select.append(option)
        }

        return select
    }

    private buildMoves(): HTMLElement {
        const section = Dom.div('moves')
        const title = document.createElement('h4')

        title.textContent = 'Moves'
        section.append(title)

        for (const move of this.moves) {
            const row = Dom.div('move-row')
            const name = Dom.inputText('move-name')
            const power = document.createElement('input')
            const accuracy = document.createElement('input')
            const type = Dom.inputText('move-type')
            const remove = Dom.button('×', 'delete-move')

            name.value = move.name
            name.placeholder = 'Name'
            power.type = 'number'
            power.min = '0'
            power.className = 'move-power'
            power.value = String(move.power)
            power.title = 'Power'
            accuracy.type = 'number'
            accuracy.min = '0'
            accuracy.max = '100'
            accuracy.className = 'move-accuracy'
            accuracy.value = String(move.accuracy)
            accuracy.title = 'Accuracy %'
            type.value = move.type
            type.placeholder = 'type'

            const damageClass = document.createElement('select')

            damageClass.className = 'move-class'
            damageClass.title = 'Physical hits with attack against defense; special with the special pair'

            for (const each of DAMAGE_CLASSES) {
                damageClass.append(new Option(each, each, false, each === move.damageClass))
            }

            for (const control of [name, power, accuracy, type, damageClass, remove]) {
                control.dataset.id = move.id
            }

            row.append(name, Dom.span('Pow', 'hint'), power, Dom.span('Acc', 'hint'), accuracy, type, damageClass, remove)
            section.append(row)
        }

        section.append(Dom.button('+ Move', 'new-move'))

        return section
    }

    private buildStarter(): HTMLElement {
        const section = Dom.div('starter')
        const row = Dom.div('row')
        const select = document.createElement('select')
        const level = document.createElement('input')

        select.className = 'starter-species'

        const none = document.createElement('option')

        none.value = ''
        none.textContent = 'nobody'
        none.selected = this.starter === null
        select.append(none)

        for (const species of this.species) {
            const option = document.createElement('option')

            option.value = species.id
            option.textContent = species.name
            option.selected = this.starter?.speciesId === species.id
            select.append(option)
        }

        level.type = 'number'
        level.min = String(MIN_LEVEL)
        level.max = String(MAX_LEVEL)
        level.className = 'starter-level'
        level.value = String(this.starter?.level ?? 5)
        level.disabled = this.starter === null

        row.append(Dom.label('A new game starts with', 'hint'), select, Dom.span('at level', 'hint'), level)
        section.append(row)

        return section
    }

    private selected(): Species | undefined {
        return this.species.find(species => species.id === this.selectedId)
    }

    private async reload(): Promise<void> {
        const project = await projectRepository.load()

        this.species = project.species
        this.moves = project.moves
        this.starter = project.starter
        this.typeChart = project.typeChart
        this.types = typeNames(project)
    }

    private async refresh(): Promise<void> {
        await this.reload()

        if (this.selected() === undefined) {
            this.selectedId = this.species[0]?.id
        }

        this.patch()
    }

    private handleSelect(event: Event): void {
        if (event.target instanceof HTMLSelectElement) {
            this.selectedId = event.target.value
            this.patch()
        }
    }

    private async handleNewSpecies(): Promise<void> {
        const name = window.prompt('Species name', 'Species ' + (this.species.length + 1))

        if (name === null || name.trim() === '') {
            return
        }

        const created = await projectRepository.createSpecies({ name: name.trim(), types: ['normal'], baseStats: DEFAULT_BASE_STATS, learnset: [] })

        this.selectedId = created.id
        await this.refresh()
    }

    private async handleDeleteSpecies(): Promise<void> {
        const selected = this.selected()

        if (selected === undefined || !window.confirm(`Delete species "${selected.name}"? A starter of it is cleared.`)) {
            return
        }

        await projectRepository.deleteSpecies(selected.id)
        await this.refresh()
    }

    /** Reads the whole form, so every field saves together. */
    private speciesFromForm(selected: Species): Species | undefined {
        const name = this.findOne<HTMLInputElement>('.species-name')?.value.trim() ?? ''
        const typeOne = this.findOne<HTMLInputElement>('.type-one')?.value.trim() ?? ''
        const typeTwo = this.findOne<HTMLInputElement>('.type-two')?.value.trim() ?? ''

        if (name === '' || typeOne === '') {
            return undefined
        }

        const baseStats = { ...selected.baseStats }

        for (const stat of STAT_NAMES) {
            const value = Math.floor(Number(this.findOne<HTMLInputElement>('.stat-' + stat)?.value))

            if (!Number.isInteger(value) || value < 0) {
                return undefined
            }

            baseStats[stat] = value
        }

        const levels = this.findAll<HTMLInputElement>('.learn-row .level')
        const moves = this.findAll<HTMLSelectElement>('.learn-row .learn-move')
        const learnset = levels.map((level, index) => ({
            level: Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, Math.floor(Number(level.value)) || MIN_LEVEL)),
            moveId: moves[index]?.value ?? '',
        })).filter(entry => entry.moveId !== '')

        return { id: selected.id, name, types: typeTwo === '' ? [typeOne] : [typeOne, typeTwo], baseStats, learnset }
    }

    private async handleSpeciesChange(): Promise<void> {
        const selected = this.selected()

        if (selected === undefined) {
            return
        }

        const edited = this.speciesFromForm(selected)

        if (edited === undefined) {
            await this.refresh()
            return
        }

        await projectRepository.saveSpecies(edited)
        await this.refresh()
    }

    private async handleAddLearn(): Promise<void> {
        const selected = this.selected()
        const firstMove = this.moves[0]

        if (selected === undefined || firstMove === undefined) {
            return
        }

        const edited = this.speciesFromForm(selected) ?? selected
        const lastLevel = edited.learnset[edited.learnset.length - 1]?.level ?? 0

        await projectRepository.saveSpecies({ ...edited, learnset: [...edited.learnset, { level: Math.min(MAX_LEVEL, lastLevel + 1), moveId: firstMove.id }] })
        await this.refresh()
    }

    private async handleRemoveLearn(event: Event): Promise<void> {
        const selected = this.selected()
        const index = event.target instanceof HTMLElement ? Number(event.target.dataset.index) : NaN

        if (selected === undefined || !Number.isInteger(index)) {
            return
        }

        const edited = this.speciesFromForm(selected) ?? selected

        await projectRepository.saveSpecies({ ...edited, learnset: edited.learnset.filter((_entry, each) => each !== index) })
        await this.refresh()
    }

    private async handleNewMove(): Promise<void> {
        const name = window.prompt('Move name', 'Move ' + (this.moves.length + 1))

        if (name === null || name.trim() === '') {
            return
        }

        await projectRepository.createMove({ name: name.trim(), power: 40, accuracy: 100, type: 'normal', damageClass: 'physical' })
        await this.refresh()
    }

    /** The chart as a grid: attacking types down, defending across, a multiplier in every cell. Only exceptions to ×1 are stored. */
    private buildTypeChart(): HTMLElement {
        const section = Dom.div('type-chart')
        const title = document.createElement('h4')
        const hint = Dom.span('Attacking type down the side, defending type across the top. Types come from species and moves; "+ Type" adds one to the chart first.', 'hint')

        title.textContent = 'Type chart'
        section.append(title, hint)

        if (this.types.length > 0) {
            const table = document.createElement('table')
            const head = document.createElement('tr')

            table.className = 'chart'
            head.append(document.createElement('th'))

            for (const defending of this.types) {
                const th = document.createElement('th')

                th.textContent = defending
                head.append(th)
            }

            table.append(head)

            for (const attacking of this.types) {
                const row = document.createElement('tr')
                const label = document.createElement('th')

                label.className = 'attacking'
                label.textContent = attacking + ' →'
                row.append(label)

                for (const defending of this.types) {
                    const cell = document.createElement('td')
                    const select = document.createElement('select')
                    const current = matchup(this.typeChart, attacking, defending)

                    select.className = 'matchup ' + this.multiplierClass(current)
                    select.dataset.attacking = attacking
                    select.dataset.defending = defending

                    for (const multiplier of MULTIPLIERS) {
                        select.append(new Option('×' + (multiplier === 0.5 ? '½' : String(multiplier)), String(multiplier), false, multiplier === current))
                    }

                    cell.append(select)
                    row.append(cell)
                }

                table.append(row)
            }

            section.append(table)
        }

        section.append(Dom.button('+ Type', 'new-type'))

        return section
    }

    private multiplierClass(multiplier: number): string {
        return multiplier === 0 ? 'x0' : multiplier === 0.5 ? 'x05' : multiplier === 2 ? 'x2' : 'x1'
    }

    private async handleMatchupChange(event: Event): Promise<void> {
        const select = event.target

        if (!(select instanceof HTMLSelectElement)) {
            return
        }

        const { attacking, defending } = select.dataset
        const multiplier = Number(select.value)

        if (attacking === undefined || defending === undefined || !MULTIPLIERS.includes(multiplier)) {
            return
        }

        await projectRepository.saveTypeChart(withMatchup(this.typeChart, attacking, defending, multiplier))
        await this.refresh()
    }

    /** A type not yet on any species or move enters the chart as a row with a ×1 placeholder against itself, which stores nothing until a matchup is set — so the name is kept by a ×½ self-matchup the author can change. */
    private async handleNewType(): Promise<void> {
        const name = window.prompt('Type name', '')

        if (name === null || name.trim() === '') {
            return
        }

        const type = name.trim().toLowerCase()

        if (this.types.includes(type)) {
            return
        }

        await projectRepository.saveTypeChart(withMatchup(this.typeChart, type, type, 0.5))
        await this.refresh()
    }

    private async handleMoveChange(event: Event): Promise<void> {
        const row = event.target instanceof HTMLElement ? event.target.closest('.move-row') : null
        const moveId = event.target instanceof HTMLElement ? event.target.dataset.id : undefined
        const name = row?.querySelector('.move-name')
        const power = row?.querySelector('.move-power')
        const accuracy = row?.querySelector('.move-accuracy')
        const type = row?.querySelector('.move-type')
        const damageClass = row?.querySelector('.move-class')

        if (moveId === undefined || !(name instanceof HTMLInputElement) || !(power instanceof HTMLInputElement)
            || !(accuracy instanceof HTMLInputElement) || !(type instanceof HTMLInputElement) || !(damageClass instanceof HTMLSelectElement)) {
            return
        }

        const edited: Move = {
            id: moveId,
            name: name.value.trim(),
            power: Math.max(0, Math.floor(Number(power.value)) || 0),
            accuracy: Math.min(100, Math.max(0, Math.floor(Number(accuracy.value)) || 0)),
            type: type.value.trim(),
            damageClass: isDamageClass(damageClass.value) ? damageClass.value : 'physical',
        }

        if (edited.name === '' || edited.type === '') {
            await this.refresh()
            return
        }

        await projectRepository.saveMove(edited)
        await this.refresh()
    }

    private async handleDeleteMove(event: Event): Promise<void> {
        const moveId = event.target instanceof HTMLElement ? event.target.dataset.id : undefined
        const move = this.moves.find(each => each.id === moveId)

        if (move === undefined || !window.confirm(`Delete move "${move.name}"? Learnsets that teach it forget it.`)) {
            return
        }

        await projectRepository.deleteMove(move.id)
        await this.refresh()
    }

    private async handleStarterChange(): Promise<void> {
        const speciesId = this.findOne<HTMLSelectElement>('.starter-species')?.value ?? ''
        const level = Math.floor(Number(this.findOne<HTMLInputElement>('.starter-level')?.value))

        if (speciesId === '') {
            await projectRepository.setStarter(null)
        } else {
            await projectRepository.setStarter({ speciesId, level: Number.isInteger(level) ? Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, level)) : 5 })
        }

        await this.refresh()
    }
}
