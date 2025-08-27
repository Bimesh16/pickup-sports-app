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
