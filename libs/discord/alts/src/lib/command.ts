import { AutocompleteInteraction, ButtonInteraction, ChatInputCommandInteraction } from 'discord.js'
import { sendCountResponse, sendCountRealtimeUpdates } from './count'
import { sendMatchResponse, sendSearchSuggestions, updateMatches } from './match'

class AltCommandHandler {
  public constructor(
    public name = 'alt',
    public description = 'Interact with alt data',
    public subcommands = [
      {
        name: 'count',
        description: 'Shows how many alts were identified since alt matching was "fixed"',
      },
      {
        name: 'match',
        description: 'Shows all alt characters of a given player',
        args: [
          {
            type: 'string',
            name: 'name',
            description: 'ingame name',
            required: true,
            autocomplete: true,
          },
          {
            type: 'boolean',
            name: 'full',
            description: 'show stats for all classes',
          },
        ],
      },
    ]
  ) {}

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand()
    if (subcommand === 'match') return this._match(interaction)
    else if (subcommand === 'count') return this._count(interaction)
  }

  public async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand()

    if (subcommand === 'match') return sendSearchSuggestions(interaction)
  }

  public async executeButton(interaction: ButtonInteraction) {
    const interactionId = interaction.customId.split('-')[1]
    if (interactionId === 'update') return updateMatches(interaction)
  }

  private async _count(interaction: ChatInputCommandInteraction): Promise<void> {
    // Should do realtime updates on a single channel if owner requests
    // it, otherwise just reply with the count
    if (interaction.user.id === '83598701120978944') {
      return sendCountRealtimeUpdates(interaction)
    } else {
      return sendCountResponse(interaction)
    }
  }

  private async _match(interaction: ChatInputCommandInteraction): Promise<void> {
    return sendMatchResponse(interaction)
  }
}

export const altCommandHandler = new AltCommandHandler()
