import * as Client from 'cubic-client'

const client = new Client({
  api_url: 'ws://alts:3003/ws',
  auth_url: 'ws://alts:3030/ws',
})

export async function updateAllAlts(playerName: string): Promise<Response> {
  return client.post(`/character/${playerName}/updateAll`)
}

export async function getPlayerSearchSuggestions(
  query: string
): Promise<Response & { result: string[] }> {
  return client.get(`/character/search?query=${query}`)
}

export async function getAltMatches(
  playerName: string,
  showInaccurate?: boolean,
): Promise<Response & { result: { alts: Alt[]; hints: number } }> {
  return client.get(`/character/${playerName}/alts${showInaccurate ? '?showInaccurate=true' : ''}`)
}

type Response = {
  success: boolean
  error?: string
  result?: any
}

type Alt = {
  name: string
}
