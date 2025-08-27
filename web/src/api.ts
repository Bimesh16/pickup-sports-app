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
