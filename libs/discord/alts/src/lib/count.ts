import * as Client from 'cubic-client'
import { ChatInputCommandInteraction, InteractionResponse } from 'discord.js'

const text = ' alts identified with the new matching algorithm.'
const channelText = '-alts-found'
let realtimeInterval = setInterval(() => {}, Math.pow(2, 30))
const client = new Client({
  api_url: 'ws://alts:3003/ws',
  auth_url: 'ws://alts:3030/ws',
})

export async function sendCountRealtimeUpdates(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  clearInterval(realtimeInterval)

  const count = await getCount()
  const message = await interaction.channel.send(count + text)

  await interaction.channel.setName(count + channelText)
  await interaction.reply({ content: 'ok', ephemeral: true })

  setChannelUpdateInterval(interaction, message)
}

export async function sendCountResponse(interaction: ChatInputCommandInteraction): Promise<void> {
  const count = await getCount()

  await interaction.reply({ content: count + text, ephemeral: true })
}

async function setChannelUpdateInterval(interaction, message) {
  realtimeInterval = setInterval(async () => {
    const count = await getCount()

    interaction.channel.setName(count + channelText)
    message.edit(count + text)
  }, 1000 * 60 * 5) // Discord API allows 2 edits per 10 minutes
}

async function getCount() {
  const { result }: { result: number } = await client.get('/character/count')

  return result.toLocaleString('en-US')
}
