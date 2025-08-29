import React, { useEffect, useState } from 'react'
import { getAbuseReports, getFeatureFlags, updateFeatureFlag, AdminFeatureFlag } from './api'

export default function AdminApp() {
  const [flags, setFlags] = useState<AdminFeatureFlag[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const [f, r] = await Promise.all([getFeatureFlags(), getAbuseReports()])
        setFlags(f)
        setReports(r)
      } catch (e: any) {
        setError(e.message ?? 'Error')
      }
    })()
  }, [])

  const toggleFlag = async (flag: AdminFeatureFlag, enabled: boolean) => {
    try {
      const updated = await updateFeatureFlag(flag.name, { enabled, rolloutPercentage: flag.rolloutPercentage })
      setFlags(flags.map((fl) => (fl.name === updated.name ? updated : fl)))
    } catch (e: any) {
      setError(e.message ?? 'Error')
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '2rem auto', fontFamily: 'system-ui, Arial' }}>
      <h1>Admin Panel</h1>
      {error && <div style={{ color: 'crimson' }}>Error: {error}</div>}
      <section>
        <h2>Feature Flags</h2>
        <ul>
          {flags.map((f) => (
            <li key={f.name}>
              <label>
                <input type="checkbox" checked={f.enabled} onChange={(e) => toggleFlag(f, e.target.checked)} />
                {f.name} ({f.rolloutPercentage}%)
              </label>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Abuse Reports</h2>
        <ul>
          {reports.map((r: any) => (
            <li key={r.id}>
              #{r.id} - {r.reason} ({r.status})
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
