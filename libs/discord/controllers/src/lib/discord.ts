import { Client, GuildMember, Interaction, Message } from 'discord.js'
import { createServiceLogger } from '@ps2gg/common/logging'
import { redirectLegacyAltSpy, removeNoneThreadedMessage } from '@ps2gg/discord/alts'

const logger = createServiceLogger('Discord')

export class Discord {
  public constructor(private _bot: Client) { }

  public onReady(): void {
    logger.info(`${this._bot.user?.username} connected.`)
  }

  public async onMessage(message: Message): Promise<void> {
    if (message.author.bot) return
    this._log(message)
    await redirectLegacyAltSpy(message)
    await removeNoneThreadedMessage(message)
  }

  public onInteraction(interaction: Interaction): void {
    if (!interaction.isCommand()) return
    this._log(interaction)
  }

  public onGuildMemberAdd(member: GuildMember): void {
    const now = new Date().getTime()
    const creationDate = new Date(parseInt(member.id) / 4194304 + 1420070400000).getTime()
    const creationDays = new Date(now - creationDate).getTime() / (1000 * 60 * 60 * 24)
    const creationDaysRounded = Math.round(creationDays)
    const message = `<@${member.id}> • created ${creationDaysRounded} days ago`

    this._sendChannel('893477714848280576', '942405093674844231', message)
  }

  private _log(message) {
    const isMessage = message.author

    if (isPeepo(message, isMessage)) return
    logger.info(`${isMessage ? messageToString(message) : instanceToString(message)}`)

    this._sendChannel(
      '893477714848280576',
      '942405149471682570',
      isMessage ? messageToString(message) : instanceToString(message)
    )
  }

  private _sendChannel(guild: string, channel: string, message) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this._bot.guilds.cache.get(guild).channels.cache.get(channel).send(message)
  }
}

function isPeepo(message, isMessage) {
  const peepoId = '715535257939607602'

  return isMessage ? message.author.id === peepoId : message.user.id === peepoId
}

function messageToString(message) {
  return `<@${message.author.id}> [${message.author.username}#${message.author.discriminator}]: ${message.content}`
}

function instanceToString(instance) {
  return `<@${instance.user.id}> interaction: ${instance.commandName} | subcommand: ${instance.options._subcommand
    } | options: ${JSON.stringify(instance.options._hoistedOptions)}`
}
