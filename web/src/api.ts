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

export async function joinGame(id: number, captchaToken?: string): Promise<any> {
  const res = await fetch(`/games/${id}/join`, {
    method: 'POST',
    headers: {
      ...(captchaToken ? { 'X-Captcha-Token': captchaToken } : {}),
    },
  })
  if (res.status === 429) {
    const data = await res.json()
    if (data.captchaRequired) throw new Error('captcha_required')
    throw new Error(data.message || 'Too many requests')
  }
  if (!res.ok) throw new Error('Failed to join')
  return res.json()
}

export async function login(username: string, password: string, captchaToken?: string): Promise<any> {
  const res = await fetch('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(captchaToken ? { 'X-Captcha-Token': captchaToken } : {}),
    },
    body: JSON.stringify({ username, password }),
  })
  if (res.status === 429) {
    const data = await res.json()
    if (data.captchaRequired) throw new Error('captcha_required')
    throw new Error(data.message || 'Too many requests')
  }
  if (!res.ok) throw new Error('Login failed')
  return res.json()
}
// Session management
export interface Session {
  id: number
  deviceId: string | null
  userAgent: string | null
  ip: string | null
  createdAt: string
  lastUsedAt: string | null
  expiresAt: string
}

export async function getSessions(): Promise<Session[]> {
  const res = await fetch('/auth/sessions')
  if (!res.ok) throw new Error('Failed to load sessions')
  return res.json()
}

export async function revokeSession(id: number): Promise<void> {
  const res = await fetch(`/auth/sessions/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to revoke session')
}

export async function revokeAllSessions(): Promise<void> {
  const res = await fetch('/auth/sessions', { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to revoke sessions')
}

// MFA management
export interface EnrollResponse {
  secret: string
  uri: string
}

export async function mfaEnroll(): Promise<EnrollResponse> {
  const res = await fetch('/auth/mfa/enroll', { method: 'POST' })
  if (!res.ok) throw new Error('Failed to enroll')
  return res.json()
}

export async function mfaEnable(code: string): Promise<void> {
  const res = await fetch('/auth/mfa/enable', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  })
  if (!res.ok) throw new Error('Failed to enable MFA')
}

export async function mfaDisable(): Promise<void> {
  const res = await fetch('/auth/mfa/disable', { method: 'POST' })
  if (!res.ok) throw new Error('Failed to disable MFA')
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
}
export async function getGame(id: number): Promise<any> {
  const res = await fetch(`/games/${id}`)
  if (!res.ok) throw new Error('Failed to load game')
  return res.json()
}
