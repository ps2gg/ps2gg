import { CensusQuery, censusWs } from '@ps2gg/census/api'
import { servers } from '@ps2gg/common/constants'
import { createServiceLogger } from '@ps2gg/common/logging'
import { PlayerController } from '@ps2gg/players/census'
import { RatingsController } from '@ps2gg/ratings/census'

const logger = createServiceLogger('Census')

async function subscribe() {
  censusWs.subscribe({
    worlds: Object.keys(servers),
    characters: ['all'],
    logicalAndCharactersWithWorlds: true,
    eventNames: [
      'ItemAdded',
      'PlayerLogin',
      'PlayerLogout',
      'VehicleDestroy',
      'Death',
      'ContinentLock',
    ].concat(await getAssistIds()),
  })
}

async function getAssistIds(): Promise<string[]> {
  logger.info('Fetching valid assist event ids')

  const assists = await new CensusQuery()
    .collection('experience')
    .where('description')
    .contains('Assist')
    .limit(1000)
    .get()

  const filtered = assists.experience_list.filter(filterExperienceEvents).map(parseExperienceEvents)

  logger.info(`Subscribed assist event ids: ${filtered}`)

  return filtered
}

function filterExperienceEvents({ description }) {
  const killAssistStrings = [
    'Kill Player Assist',
    'Kill Player Priority Assist',
    'Kill Player High Priority Assist',
    'Kill Assist - ',
    'Grenade Squad Assist',
    'Grenade Assist',
    'Flashbang Squad Assist',
    'Flashbang Assist',
  ]
  // 1v1 detection will still work without this, but we save some throughput
  const killAssistExcludeStrings = ['- Engi Turret', '- Phalanx', '- Drop Pod', '- R Drone']

  for (const string of killAssistStrings) {
    if (killAssistExcludeStrings.find((s) => description.includes(s))) continue
    if (description.includes(string)) return true
  }
}

function parseExperienceEvents({ experience_id }) {
  return `GainExperience_experience_id_${experience_id}`
}

new PlayerController()
new RatingsController()

subscribe()
