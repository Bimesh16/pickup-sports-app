export type AdminFeatureFlag = {
  name: string
  enabled: boolean
  rolloutPercentage: number
}

export async function getFeatureFlags(): Promise<AdminFeatureFlag[]> {
  const res = await fetch('/admin/feature-flags')
  if (!res.ok) throw new Error('Failed to load feature flags')
  return res.json()
}

export async function updateFeatureFlag(name: string, flag: { enabled: boolean; rolloutPercentage: number }): Promise<AdminFeatureFlag> {
  const res = await fetch(`/admin/feature-flags/${name}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(flag),
  })
  if (!res.ok) throw new Error('Failed to update feature flag')
  return res.json()
}

export async function getAbuseReports(): Promise<any[]> {
  const res = await fetch('/abuse-reports')
  if (!res.ok) throw new Error('Failed to load abuse reports')
  const data = await res.json()
  return data.content ?? []
}
