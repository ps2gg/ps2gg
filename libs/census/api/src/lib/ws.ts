import { client } from 'websocket'
import { player } from '@ps2gg/players-api'
import { createServiceLogger } from '@ps2gg/common/logging'
import { census } from '@ps2gg/common/constants'
import { Subscription } from '@ps2gg/census/types'

const logger = createServiceLogger('CensusWs')

class CensusWs {
  private _fns: { (...args: any): void }[] = []
  private _subscriptions: Subscription[] = []
  private _state = 'closed'
  private _useFallback = false
  private _socket: any
  private _client: any
  private _lastMessageAt: Date
  public lastMessageTimeout = 1000 * 15
  public connectionCycleInterval = 1000 * 60 * 10

  public constructor() {
    this._init()
    this._checkDeadConnection()
  }

  private async _init(urlOverride?: string) {
    try {
      const { c, s } = await this._createclient(urlOverride)
      this._closePreviousSocket()
      this._socket = s
      this._client = c
    } catch (err) {
      logger.error(err)
      setTimeout(() => this._init(urlOverride), 1000)
    }
  }

  private _closePreviousSocket() {
    if (this._socket) {
      this._socket.removeAllListeners()
      this._socket.close()
    }
  }

  private async _createclient(urlOverride): Promise<any> {
    if (this._state === 'connecting') return
    this._state = 'connecting'
    this._useFallback = !!urlOverride

    const c = new client()
    const url = urlOverride || census.wsUrl

    c.connect(url)

    return new Promise((resolve) => this._setClientListeners(c, url, resolve))
  }

  private _setClientListeners(c, url, resolve) {
    c.on('connect', (s) => this._onConnect(url, c, s, resolve))
    c.on('connectFailed', async (err) => this._onConnectFailed(err))
  }

  private _setSocketListeners(c, s, resolve) {
    s.on('message', async (message: { utf8Data: string }) =>
      this._onMessage(message, c, s, resolve)
    )
    s.on('close', async (err) => this._onClose(err))
    s.on('error', async (err) => this._onError(err))
  }

  private _onConnect(url, c, s, resolve) {
    logger.info(`connected to ${url.split('/streaming')[0]}`)
    for (const subscription of this._subscriptions) {
      this._sendWs(s, subscription)
    }
    this._setSocketListeners(c, s, resolve)
  }

  private _onConnectFailed(err) {
    logger.error(err)
    this._state = 'closed'
    // Fall back to official API if nanite systems is down
    this._init(census.wsFallbackUrl)
  }

  private _onMessage(message: { utf8Data: string }, c, s, resolve) {
    resolve({ c, s })
    this._state = 'open'
    if (this._useFallback) this._lastMessageAt = new Date()
    this._publish(JSON.parse(message.utf8Data))
  }

  private _onClose(err) {
    player.logoutAll('all')
    logger.error(err)
    this._state = 'closed'
    this._init()
  }

  private _onError(err) {
    player.logoutAll('all')
    logger.error(err)
    this._state = 'closed'
    this._socket.close()
  }

  public use(fn: { (...args: any): void }): void {
    this._fns.push(fn)
  }

  public subscribe(subscription: Subscription): void {
    subscription = {
      service: 'event',
      action: 'subscribe',
      ...subscription,
    }
    this._subscriptions.push(subscription)

    // Already connected? Fire manually
    if (this._state === 'open') {
      this._sendWs(this._socket, subscription)
    }
  }

  private _publish(data) {
    for (const fn of this._fns) {
      fn(data)
    }
  }

  private _sendWs(s, data) {
    s.send(JSON.stringify(data))
  }

  // The original census API stops sending events at some point
  private _checkDeadConnection() {
    setInterval(this._reinitializeFallback, this.connectionCycleInterval)
    setInterval(this._reinitializeFallbackIfNoMessages, this.lastMessageTimeout)
  }

  private _reinitializeFallback() {
    if (this._useFallback) {
      this._init()
    }
  }

  private _reinitializeFallbackIfNoMessages() {
    if (this._useFallback === false) return
    if (this._lastMessageAt === undefined) this._lastMessageAt = new Date()
    const now = new Date().getTime()
    const lastMessageTime = this._lastMessageAt.getTime()
    const lastMessageTimeoutExceeded = now - lastMessageTime > this.lastMessageTimeout

    if (lastMessageTimeoutExceeded) {
      this._init()
    }
  }
}

export const censusWs = new CensusWs()
