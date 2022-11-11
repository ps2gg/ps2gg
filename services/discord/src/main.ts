import { GatewayIntentBits, Client, Message } from 'discord.js'
import { Discord, Commands } from '@ps2gg/discord/controllers'
import { readFileSync } from 'fs'

const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] })
const token = readFileSync('/run/secrets/discord_token', 'utf-8')
const discord = new Discord(bot)
const commands = new Commands(bot)

bot.on('ready', async () => {
  discord.onReady()
})

bot.on('guildMemberAdd', (member) => {
  discord.onGuildMemberAdd(member)
})

bot.on('messageCreate', (message: Message) => {
  discord.onMessage(message)
})

bot.on('interactionCreate', (interaction) => {
  discord.onInteraction(interaction)
  commands.onInteraction(interaction)
})

bot.login(token)
