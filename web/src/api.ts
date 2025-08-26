import axios from 'axios'

export type FeatureFlags = {
  env: string
  recommend: boolean
  chatEnabled: boolean
}

export type TokenPair = {
  accessToken: string
  refreshToken: string
  refreshNonce?: string
  tokenType: string
  expiresInSeconds: number
}

export type GameSummary = {
  id: number
  sport: string
  location: string
  time: string
  skillLevel?: string
}

export type GamesPage = {
  content: GameSummary[]
}

export type CreateGameRequest = {
  sport: string
  location: string
  time: string
  skillLevel?: string
  latitude?: number
  longitude?: number
}

const api = axios.create()

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

export async function login(username: string, password: string): Promise<TokenPair> {
  const res = await api.post('/auth/login', { username, password })
  setAuthToken(res.data.accessToken)
  return res.data
}

export async function getFlags(): Promise<FeatureFlags> {
  const res = await api.get('/config/flags')
  return res.data
}

export async function getGames(): Promise<GamesPage> {
  const res = await api.get('/games')
  return res.data
}

export async function createGame(game: CreateGameRequest) {
  const res = await api.post('/games', game)
  return res.data
}

