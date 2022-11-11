import { AutocompleteInteraction, ButtonInteraction, ChatInputCommandInteraction } from 'discord.js'
import { Command, Actions, Action, mergeActions } from '@ps2gg/discord/command'
import { updateAllAlts, getPlayerSearchSuggestions, getAltMatches } from '@ps2gg/alts/api'
import { matchSubCommand } from './subcommands'
import { updateButton, showMoreButton } from './actions'
import { getAltEmbed } from './impl/match'

class AltCommand implements Command {
  public constructor(
    public name = 'alt',
    public description = 'Interact with alt data',
    public subcommands = [matchSubCommand],
    public actions = [updateButton, showMoreButton]
  ) { }

  public async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand()

    if (subcommand === 'match') return this._match(interaction)
  }

  public async executeAction(interaction: ButtonInteraction) {
    const interactionId = interaction.customId.split('-')[1]

    if (interactionId === 'update') return this._updateMatches(interaction)
    else if (interactionId === 'show') return this._showMore(interaction)
  }

  public async autocomplete(interaction: AutocompleteInteraction) {
    const subcommand = interaction.options.getSubcommand()

    if (subcommand === 'match') return this._search(interaction)
  }

  private async _match(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply()

    const name = interaction.options.getString('name').trim()
    const full = interaction.options.getBoolean('full')
    const nameSanitized = name.toString().replace(/[^a-z0-9]/gi, '')
    const matches = await getAltMatches(nameSanitized)
    const embed = getAltEmbed(matches, nameSanitized, full)
    const experimentalCount = matches.result.alts.reduce((previous, current) =>
      previous + (current.matchType.includes('experimental') ? 1 : 0)
      , 0)
    const hints: number = (matches.result?.hints || 0) - experimentalCount
    const actions = this._getDefaultActions(nameSanitized, hints)
    const message = await interaction.editReply({
      embeds: [embed],
      components: [actions],
    })

    await message.startThread({
      name: embed.title,
      autoArchiveDuration: 60,
    })
  }

  private async _updateMatches(interaction: ButtonInteraction) {
    await interaction.deferUpdate()

    const name = interaction.customId.split('-')[2]
    const updatingActions = this._getUpdateActions(this.actions, name)
    const actionsProcessing = new Actions(updatingActions, interaction).get(['processing', 'current'])

    await interaction.editReply({ components: [actionsProcessing] })
    await updateAllAlts(name)

    const matches = await getAltMatches(name)
    const embed = getAltEmbed(matches, name, false)
    const actionsProcessed = new Actions(updatingActions, interaction).get(['processed', 'current'])

    return interaction.editReply({ embeds: [embed], components: [actionsProcessed] })
  }

  private async _showMore(interaction: ButtonInteraction) {
    await interaction.deferUpdate()

    const name = interaction.customId.split('-')[3]
    const showMoreActions = this._getShowMoreActions(this.actions, name)
    const actionsProcessing = new Actions(showMoreActions, interaction).get(['current', 'processing'])

    await interaction.editReply({ components: [actionsProcessing] })

    const matches = await getAltMatches(name, true)
    const embed = getAltEmbed(matches, name, false)
    const actionsProcessed = new Actions(showMoreActions, interaction).get(['current', 'processed'])

    return interaction.editReply({ embeds: [embed], components: [actionsProcessed] })
  }

  private async _search(interaction: AutocompleteInteraction) {
    const query = interaction.options.getFocused()?.trim() || 'brgh'
    const suggestions = await getPlayerSearchSuggestions(query)
    const result = suggestions.result?.map((name) => {
      return { name, value: name }
    })

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (!interaction.responded) await interaction.respond(result).catch((err) => { }) // Err means it took too long
  }

  private _getDefaultActions(name: string, hints = 0) {
    const updateActions = this._getUpdateActions(this.actions, name)
    const combinedActions = this._getShowMoreActions(updateActions, name, hints)

    return new Actions(combinedActions).get(['default', 'default'])
  }

  private _getUpdateActions(actions: Action[], name) {
    const updateActionConfig = { id: `alt-update-${name}` }
    const updateActions = mergeActions(actions, 'alt-update', updateActionConfig)

    return updateActions
  }

  private _getShowMoreActions(actions: Action[], name, hints = 0) {
    const showMoreActionConfig = {
      id: `alt-show-more-${name}`,
      state: {
        default: {
          label: `Show More${hints ? ` (${hints}+)` : ''}`,
          disabled: hints === 0,
        }
      }
    }
    const showMoreActions = mergeActions(actions, 'alt-show-more', showMoreActionConfig)

    return showMoreActions
  }
}

export const altCommand = new AltCommand()
