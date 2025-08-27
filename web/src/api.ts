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

export async function promoteWaitlist(gameId: number, userId: number): Promise<void> {
  const res = await fetch(`/admin/games/${gameId}/waitlist/${userId}/promote`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to promote')
}

export async function kickParticipant(gameId: number, userId: number): Promise<void> {
  const res = await fetch(`/admin/games/${gameId}/participants/${userId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to kick')
}

export async function banParticipant(gameId: number, userId: number): Promise<void> {
  const res = await fetch(`/admin/games/${gameId}/ban/${userId}`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to ban')
}

export async function addCohost(gameId: number, userId: number): Promise<void> {
  const res = await fetch(`/admin/games/${gameId}/cohosts/${userId}`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to add co-host')
}

export async function removeCohost(gameId: number, userId: number): Promise<void> {
  const res = await fetch(`/admin/games/${gameId}/cohosts/${userId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to remove co-host')
}

export async function generateInviteToken(gameId: number): Promise<string> {
  const res = await fetch(`/admin/games/${gameId}/invite-token`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to generate token')
  const data = await res.json()
  return data.token
export async function getGame(id: number): Promise<any> {
  const res = await fetch(`/games/${id}`)
  if (!res.ok) throw new Error('Failed to load game')
  return res.json()
}
