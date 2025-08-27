export type FeatureFlags = {
  env: string
  recommend: boolean
  chatEnabled: boolean
}

export async function getFlags(): Promise<FeatureFlags> {
  const res = await fetch('/config/flags')
  if (!res.ok) throw new Error('Failed to load flags')
  return res.json()
}

export async function getGames(): Promise<any> {
  const res = await fetch('/games')
  if (!res.ok) throw new Error('Failed to load games')
  return res.json()
}

export async function getGame(id: number): Promise<any> {
  const res = await fetch(`/games/${id}`)
  if (!res.ok) throw new Error('Failed to load game')
  return res.json()
}
