import axios from 'axios'
axios.defaults.baseURL = 'http://alts:3333'

class Player {
  public logoutAll(server: string) {
    return // Debug while alts api isn't up
    // return axios.post('/player/logout', { server })
  }

  public logout(character_id: string, timestamp: Date) {
    return // Debug while alts api isn't up
    // return axios.post('/player/logout', { character_id, timestamp })
  }

  public login(character_id: string, timestamp: Date) {
    return // Debug while alts api isn't up
    // return axios.post('/player/login', { character_id, timestamp })
  }
}

export const player = new Player()
