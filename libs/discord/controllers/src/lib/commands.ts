import { createServiceLogger } from '@ps2gg/common/logging'
import { altCommandHandler } from '@ps2gg/discord/alts'
import {
  Client,
  Collection,
  Interaction,
  Message,
  REST,
  Routes,
  SlashCommandBuilder,
} from 'discord.js'
import { readFileSync } from 'fs'

const logger = createServiceLogger('Commands')
const token = readFileSync('/run/secrets/discord_token', 'utf-8')
const rest = new REST({ version: '10' }).setToken(token)

export class Commands {
  public constructor(
    private _bot: Client & { commands?: Collection<any, any> },
    private _meta: SlashCommandBuilder[] = []
  ) {
    _bot.commands = new Collection()
    this._loadCommands()
    this._registerCommands()
  }

  private _loadCommands() {
    this._bot.commands.set('alt', altCommandHandler)
    this._meta.push(this._getCommandMeta(altCommandHandler))
    logger.info(`Loaded commands: ${this._meta.map((c) => c.name)}`)
  }

  private _getCommandMeta(command) {
    const commandMeta = new SlashCommandBuilder()

    this._setCommandProperties(command, commandMeta)

    return commandMeta
  }

  private _setCommandProperties(command, commandMeta) {
    if (command.name) commandMeta.setName(command.name)
    if (command.description) commandMeta.setDescription(command.description)
    if (command.args) this._setCommandArgs(command, commandMeta)
    if (command.subcommands) this._setSubCommands(command, commandMeta)

    return commandMeta
  }

  private _setCommandArgs(command, commandMeta) {
    for (const arg of command.args) {
      if (arg.type === 'string')
        commandMeta.addStringOption((option) => this._addOption(arg, option))
      if (arg.type === 'boolean')
        commandMeta.addBooleanOption((option) => this._addOption(arg, option))
    }
  }

  private _addOption(arg, option) {
    if (arg.name) option.setName(arg.name)
    if (arg.description) option.setDescription(arg.description)
    if (arg.required) option.setRequired(arg.required)
    if (arg.autocomplete) option.setAutocomplete(arg.autocomplete)

    return option
  }

  private _setSubCommands(command, commandMeta) {
    for (const subcommand of command.subcommands) {
      commandMeta.addSubcommand((option) => this._setCommandProperties(subcommand, option))
    }
  }

  private async _registerCommands() {
    const clientId = '715535257939607602'

    await rest.put(Routes.applicationCommands(clientId), {
      body: this._meta.map((c) => c.toJSON()),
    })
    logger.info('Registered global Slash Commands')
  }

  public onMessage(message: Message): void {
    if (message.author.bot) return
  }

  public async onInteraction(interaction: Interaction): Promise<void> {
    if (!interaction.guild) return
    const isCommand = interaction.isChatInputCommand()
    const isAutocomplete = interaction.isAutocomplete()
    const isButton = interaction.isButton()

    if (!(isCommand || isAutocomplete || isButton)) return

    const commandName = isButton ? interaction.customId.split('-')[0] : interaction.commandName
    const command = this._bot.commands.get(commandName)

    if (!command) return

    try {
      this._runInteraction(interaction, command, isCommand, isAutocomplete, isButton)
    } catch (error) {
      this._runInteractionError(interaction, error, isCommand)
    }
  }

  private async _runInteraction(interaction, command, isCommand, isAutocomplete, isButton) {
    if (isCommand) {
      await command.execute(interaction)
    } else if (isAutocomplete) {
      await command.autocomplete(interaction)
    } else if (isButton) {
      console.log(interaction)
      await command.executeButton(interaction)
    }
  }

  private async _runInteractionError(interaction, error, isCommand) {
    logger.error(`${interaction.commandName}: ${error.toString()}`)
    if (isCommand) await interaction.reply({ content: `\`\`\`${error}\`\`\``, ephemeral: true })
  }
}
