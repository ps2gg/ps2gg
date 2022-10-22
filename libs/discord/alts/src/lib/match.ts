import * as Client from 'cubic-client'
import { format } from 'timeago.js'
import {
  ActionRowBuilder,
  AutocompleteInteraction,
  ButtonBuilder,
  ButtonStyle,
  ButtonInteraction,
  ChatInputCommandInteraction,
} from 'discord.js'
import { emojis, servers } from '@ps2gg/common/constants'
import { getRegion } from '@ps2gg/common/util'

const client = new Client({
  api_url: 'ws://alts:3003/ws',
  auth_url: 'ws://alts:3030/ws',
})

export async function sendMatchResponse(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply()

  const name = interaction.options.getString('name').trim()
  const full = interaction.options.getBoolean('full')
  const nameSanitized = name.toString().replace(/[^a-z0-9]/gi, '')
  const matches = await getMatches(nameSanitized)
  const embed = getEmbed(matches, nameSanitized, full)
  const actions = getActions(nameSanitized, false, false)

  await interaction.editReply({
    content: '**!DEV BUILD!** Check <#1031775486235389972> for current limitations.',
    embeds: [embed],
    // @ts-ignore
    components: [actions],
  })
}

export async function sendSearchSuggestions(interaction: AutocompleteInteraction): Promise<void> {
  const query = interaction.options.getFocused()?.trim() || 'brgh'
  const suggestions = await getSearchSuggestions(query)
  const result = suggestions.result?.map((name) => {
    return { name, value: name }
  })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  if (!interaction.responded) await interaction.respond(result).catch((err) => {}) // Err means it took too long
}

export async function updateMatches(interaction: ButtonInteraction): Promise<void> {
  const name = interaction.customId.split('-')[2]

  await interaction.deferUpdate()

  const updatingActions = getActions(name, true, false)

  // @ts-ignore
  await interaction.editReply({ components: [updatingActions] })

  await client.post(`/character/${name}/updateAll`)

  const matches = await getMatches(name)
  const embed = getEmbed(matches, name, false)
  const updatedActions = getActions(name, false, true)

  // @ts-ignore
  return interaction.editReply({ embeds: [embed], components: [updatedActions] })
}

async function getSearchSuggestions(query) {
  return client.get(`/character/search?query=${query}`)
}

async function getMatches(name) {
  return client.get(`/character/${name}/alts`)
}

function getActions(name, updating, updated) {
  const button = new ButtonBuilder()
    .setCustomId(`alt-update-${name}`)
    .setStyle(ButtonStyle.Secondary)

  if (updating) {
    button.setLabel('Updating...')
    button.setDisabled(true)
  } else if (updated) {
    button.setLabel('Updated')
    button.setEmoji('✅')
    button.setDisabled(true)
  } else {
    button.setLabel('Update')
  }

  return new ActionRowBuilder().addComponents(button)
}

function getEmbed(matches, name, full) {
  if (!matches.error && matches.result.length < 50) {
    return getFullEmbed(matches.result, full, name)
  } else if (!matches.error) {
    return getWarningEmbed(name, matches.result)
  } else {
    return getErrorEmbed(name, matches)
  }
}

function getFullEmbed(matches, full, name) {
  const main = matches.find((a) => a.name.toLowerCase() === name.toLowerCase())
  const characters = getCharacters(matches)
  const stats = getStats(matches)
  const roles = getRoles(stats, full)
  const roleStats = getRoleStats(roles, stats, matches)
  const globalGrade = getGrade(stats.global, 'global', matches)

  return {
    title: `${getOutfit(main)}${main.name}`,
    url: `https://ps2.fisu.pw/player/?name=${main.name.toLowerCase()}`,
    author: {
      name: `${Math.round(stats.global.rating)} ELO [${globalGrade}]`,
      //icon_url: 'https://cdn.discordapp.com/emojis/760748145801297990.png?v=1', // elo
    },
    fields: [].concat(characters).concat(roleStats.slice().reverse()),
    footer: getFooter(matches),
  }
}

function getWarningEmbed(name, matches) {
  return {
    title: `Found too many matches for ${name}.`,
    description: `More than ${matches.length} matches.`,
  }
}

function getErrorEmbed(name, matches) {
  return {
    title: `Found no matches for ${name}.`,
    description: matches.error,
  }
}

function getCharacters(matches) {
  const serverAlts = []
  const maxNameLength = getMaxNameLength(matches)

  for (const server of Object.values(servers)) {
    addServerCharacters(serverAlts, server, matches, maxNameLength)
  }

  return serverAlts
}

function addServerCharacters(serverAlts, server: string, matches, maxNameLength) {
  const characters = matches.filter((a) => a.server === server)
  if (!characters.length) return

  const strings = []
  for (const character of characters) {
    strings.push(createAltString(character, maxNameLength))
  }

  serverAlts.push({
    name: `${getRegionEmoji(server)} ${server}`,
    value: `\`\`\`prolog\n${strings.join('\n')}\`\`\`\n`,
  })
}

function getMaxNameLength(matches) {
  let max = 0

  for (const alt of matches) {
    const oLength = getOutfit(alt).length
    if (oLength + alt.name.length > max) max = oLength + alt.name.length
  }

  return max
}

function createAltString(alt, max) {
  const outfit = getOutfit(alt)
  const padLength = max - getOutfit(alt).length
  const name = alt.name.padEnd(outfit ? padLength : padLength)
  const br = getBattleRank(alt).toLowerCase()
  const faction = getFaction(alt)
  const experimental = alt.isExperimental ? ' · 🧪' : ''

  return `${outfit}${name} · ${faction}${br}${experimental} `
}

function getOutfit(alt) {
  return alt.outfit ? `[${alt.outfit}] ` : ''
}

function getRegionEmoji(server: string) {
  const region = getRegion(server)

  switch (region) {
    case 'NA':
      return emojis.na
    case 'EU':
      return emojis.eu
    case 'CN':
      return emojis.cn
  }
}

function getFaction(alt) {
  switch (alt.faction) {
    case 'TR':
      return 'ᴛʀ'
    case 'NC':
      return 'ɴᴄ'
    case 'VS':
      return 'ᴠs'
    default:
      return 'ɴs'
  }
}

function getBattleRank(alt) {
  return alt.battleRank ? ` · ʙʀ${alt.battleRank}` : ''
}

function getStats(matches) {
  const stats = {
    global: {
      playTime: 0,
      rating: 0,
      kills: 0,
    },
  }

  for (const alt of matches) {
    if (!alt.stats) continue
    sumClassStats(stats, alt.stats, alt.rating)
    sumGlobalStats(stats, alt.stats, alt.rating)
  }
  for (const role in stats) {
    stats[role].playTimePercent = stats[role].playTime / stats.global.playTime
  }

  return stats
}

function sumClassStats(globalStats, characterStats, rating) {
  for (const role in characterStats) {
    if (['playTime'].includes(role)) continue
    sumStats(globalStats, characterStats, role)
    setElo(globalStats, rating, role)
  }
}

function sumGlobalStats(globalStats, characterStats, rating) {
  if (!characterStats.playTime) return
  sumStats(globalStats, characterStats, 'global')
  setElo(globalStats, rating, 'global')
}

function sumStats(globalStats, characterStats, role) {
  if (!globalStats[role]) globalStats[role] = { kills: 0, playTime: 0, playTimePercent: 0 }
  const stats = role === 'global' ? characterStats : characterStats[role]

  globalStats[role].kills += stats.kills
  globalStats[role].playTime += stats.playTime
}

function setElo(globalStats, rating, role) {
  if (!globalStats[role].rating)
    globalStats[role] = { ...globalStats[role], rating: 0, deviation: 100 }
  const validRating = rating && rating[role]
  const newDeviationMin = validRating && rating[role].deviation < globalStats[role].deviation

  if (!validRating || !newDeviationMin) return
  globalStats[role].rating = rating[role].rating
  globalStats[role].deviation = rating[role].deviation
}

function getRoles(stats, full) {
  const roles = []

  for (const role in stats) {
    if (role === 'global') continue
    if (full || stats[role].playTimePercent > 0.15) roles.push(role)
  }

  return roles
}

function getRoleStats(roles, stats, matches) {
  const roleStats = []

  for (const role of roles) {
    const statsStrings = getRoleStatsStrings(stats[role], role, matches)

    roleStats.push({
      name: `${emojis[role]} ${capitalize(role)}`,
      value: `\`\`\`prolog\n${statsStrings.join('\n')}\`\`\``,
      inline: true,
    })
  }

  return roleStats
}

function getRoleStatsStrings(stats, role, matches) {
  const strings: string[] = []

  addElo(strings, stats, role, matches)
  addKills(strings, stats)
  addTime(strings, stats)
  addUsage(strings, stats)
  padStrings(strings)

  return strings
}

function addElo(strings, stats, role, matches) {
  if (stats.rating) {
    const grade = getGrade(stats, role, matches)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    strings.push(`${Math.round(stats.rating)} ᴇʟᴏ [${grade}]`)
  } else {
    strings.push(`0 ᴇʟᴏ [-]`)
  }
}

function addKills(strings, stats) {
  if (!stats.kills) return
  strings.push(`${stats.kills} ᴋɪʟʟs`)
}

function addTime(strings, stats) {
  strings.push(`${(stats.playTime / 60 / 60 / 24).toFixed(2)} ᴅᴀʏs`)
}

function addUsage(strings, stats) {
  strings.push(`${(stats.playTimePercent * 100).toFixed(2)} ﹪`)
}

function padStrings(strings: string[]) {
  // Get longest number in front
  const max = Math.max(...strings.map((s) => s.split(' ')[0].length))

  for (let i = 0; i < strings.length; i++) {
    const split = strings[i].split(' ')

    strings[i] = split[0].padEnd(max) + ' ' + split.slice(1).join(' ')
  }
}

function getGrade(stats, role, matches) {
  return '-'
}

function getFooter(matches) {
  const online = matches.find((a) => a.online)
  const onlineIcon = 'https://cdn.discordapp.com/emojis/717334812083355658.png?v=1'
  const offlineIcon = 'https://cdn.discordapp.com/emojis/717334809621430352.png?v=1'
  const { lastLogout, alt } = getLastLogout(online, matches)
  const agesAgo = lastLogout < new Date().getTime() - 1000 * 60 * 60 * 24 * 365 * 20
  const text = online
    ? `Playing as ${online.name}, ${online.server} ${online.faction}.`
    : `Last seen ${agesAgo ? 'a looong time ago' : format(lastLogout)}${
        alt ? ` as ${alt.name}` : ''
      }.`

  return {
    // 37 is max length without breaking the format
    text: text.length > 37 ? text.slice(0, 37 - 3) + '...' : text,
    icon_url: online ? onlineIcon : offlineIcon,
  }
}

function getLastLogout(online, matches) {
  if (online) return {}
  let max = 0
  let alt = null

  matches.map((a) => {
    if (!a.lastLogout) return
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const d = new Date(a.lastLogout).getTime()

    if (d > max) {
      max = d
      alt = a
    }
  })

  return { lastLogout: max, alt }
}

function cap(str) {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1))
}

function capitalize(str) {
  return str.length <= 3 ? str.toUpperCase() : cap(str)
}
