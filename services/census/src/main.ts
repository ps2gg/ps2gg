import { CensusQuery, censusWs } from '@ps2gg/census/api'
import { servers } from '@ps2gg/common/constants'
import { PlayerController } from './controllers/player'
import { createServiceLogger } from '@ps2gg/common/logging'

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
  return description.includes('Kill') && !description.includes('HIVE')
}

function parseExperienceEvents({ experience_id }) {
  return `GainExperience_experience_id_${experience_id}`
}

new PlayerController()
subscribe()
