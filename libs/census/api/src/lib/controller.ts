/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { continents, infantry, servers, vehicles } from '@ps2gg/common/constants'
import { CensusWsEvent, Heartbeat, PlayerLoadout } from '@ps2gg/census/types'
import { censusWs } from './ws'

/**
 * Parent class to be inherited by service-specific controllers
 * The method parameters only include what's needed, not what's
 * available on the API.
 */
export class Controller {
  private _lastLoginId: string
  private _lastLogoutId: string

  public constructor() {
    this._registerEventListeners()
  }

  private _registerEventListeners(): void {
    censusWs.use((data) => this._onHeartbeat(data))
    censusWs.use((data) => this._onItemAdded(data))
    censusWs.use((data) => this._onDeath(data))
    censusWs.use((data) => this._onVehicleDestroy(data))
    censusWs.use((data) => this._onGainExperience(data))
    censusWs.use((data) => this._onContinentLock(data))
    censusWs.use((data) => this._onLogin(data))
    censusWs.use((data) => this._onLogout(data))
  }

  public onHeartbeat(heartbeat: Heartbeat): void {}
  private _onHeartbeat(data: CensusWsEvent): void {
    if (data.type === 'heartbeat') {
      this.onHeartbeat(data.online)
    }
  }

  public onItemAdded(character_id: string, item_id: string, context: string): void {}
  private _onItemAdded(data: CensusWsEvent): void {
    const { payload } = data
    if (!payload) return

    if (payload.event_name === 'ItemAdded') {
      const { character_id, context, item_id } = payload

      this.onItemAdded(character_id, item_id, context)
    }
  }

  public onDeath(
    timestamp: Date,
    server: string,
    continent: string,
    winner: PlayerLoadout,
    loser: PlayerLoadout,
    loadout: string,
    vehicle: string
  ): void {}
  private _onDeath(data: CensusWsEvent): void {
    const { payload } = data
    if (!payload) return

    if (payload.event_name === 'Death') {
      const { winner, loser } = this._getWinnerLoser(payload)
      const timestamp = new Date(parseInt(payload.timestamp) * 1000)
      const server = servers[payload.world_id]
      const continent = continents[payload.zone_id]
      const loadout = infantry[winner.loadout_id]
      const vehicle = vehicles[winner.vehicle_id]

      this.onDeath(timestamp, server, continent, winner, loser, loadout, vehicle)
    }
  }

  public onVehicleDestroy(
    timestamp: Date,
    server: string,
    continent: string,
    winner: PlayerLoadout,
    loser: PlayerLoadout,
    loadout: string,
    vehicle: string
  ): void {}
  private _onVehicleDestroy(data: CensusWsEvent) {
    const { payload } = data
    if (!payload) return

    if (payload.event_name === 'VehicleDestroy') {
      const { winner, loser } = this._getWinnerLoser(payload)
      const timestamp = new Date(parseInt(payload.timestamp) * 1000)
      const server = servers[payload.world_id]
      const continent = continents[payload.zone_id]
      const loadout = infantry[winner.loadout_id]
      const vehicle = vehicles[winner.vehicle_id]

      this.onVehicleDestroy(timestamp, server, continent, winner, loser, loadout, vehicle)
    }
  }

  public onGainExperience(timestamp: Date, character_id: string, other_id: string): void {}
  private _onGainExperience(data: CensusWsEvent) {
    const { payload } = data
    if (!payload) return

    if (payload.event_name === 'GainExperience') {
      const { character_id, other_id } = payload
      const timestamp = new Date(parseInt(payload.timestamp) * 1000)

      this.onGainExperience(timestamp, character_id, other_id)
    }
  }

  public onContinentLock(server: string, continent: string): void {}
  private _onContinentLock(data: CensusWsEvent) {
    const { payload } = data
    if (!payload) return

    if (payload.event_name === 'ContinentLock') {
      const server = servers[payload.world_id]
      const continent = continents[payload.zone_id]

      this.onContinentLock(server, continent)
    }
  }

  public onLogin(character_id: string, timestamp: Date): void {}
  private _onLogin(data: CensusWsEvent) {
    const { payload } = data
    if (!payload) return
    const { character_id } = payload

    if (payload.event_name === 'PlayerLogin' && character_id !== this._lastLoginId) {
      const timestamp = new Date(parseInt(payload.timestamp) * 1000)

      this._lastLoginId = character_id
      this.onLogin(character_id, timestamp)
    }
  }

  public onLogout(character_id: string, timestamp: Date): void {}
  private _onLogout(data: CensusWsEvent) {
    const { payload } = data
    if (!payload) return
    const { character_id } = payload

    if (payload.event_name === 'PlayerLogout' && character_id !== this._lastLogoutId) {
      const timestamp = new Date(parseInt(payload.timestamp) * 1000)

      this._lastLogoutId = character_id
      this.onLogout(character_id, timestamp)
    }
  }

  private _getWinnerLoser(payload) {
    return {
      winner: {
        character_id: payload.attacker_character_id,
        vehicle_id: payload.attacker_vehicle_id,
        loadout_id: payload.attacker_loadout_id,
      },
      loser: {
        character_id: payload.character_id,
        vehicle_id: payload.vehicle_id,
        loadout_id: payload.character_loadout_id,
      },
    }
  }
}
