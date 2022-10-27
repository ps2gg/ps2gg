import { servers } from '@ps2gg/common/constants'
import { player } from '@ps2gg/players-api'
import { createServiceLogger } from '@ps2gg/common/logging'
import { Heartbeat } from '@ps2gg/census/types'
import { Controller } from '@ps2gg/census/api'

const logger = createServiceLogger('Players')

export class PlayerController extends Controller {
  public constructor() {
    super()
    logger.info("Controller initialized, resetting every player's online status.")
    player.logoutAll('all')
  }

  public onHeartbeat(heartbeat: Heartbeat): void {
    for (const server_id in servers) {
      const server: string = servers[server_id]

      if (heartbeat[`EventServerEndpoint_${server}_${server_id}`] === 'false') {
        logger.info(`${server} went offline, logging out all players.`)
        player.logoutAll(server)
      }
    }
  }

  public onLogin(character_id: string, timestamp: Date): void {
    logger.info(`${character_id} logged in, setting online status.`)
    player.login(character_id, timestamp)
  }

  public onLogout(character_id: string, timestamp: Date): void {
    logger.info(`${character_id} logged out, setting offline status.`)
    player.logout(character_id, timestamp)
  }
}
