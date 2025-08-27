import React, { useEffect, useState } from 'react'
import { getSessions, revokeSession, revokeAllSessions, Session } from '../../api'

export function Sessions() {
  const [items, setItems] = useState<Session[]>([])
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      const s = await getSessions()
      setItems(s)
    } catch (e: any) {
      setError(e.message ?? 'Error')
    }
  }

  useEffect(() => {
    load()
  }, [])

  const revoke = async (id: number) => {
    await revokeSession(id)
    load()
  }

  const revokeAll = async () => {
    await revokeAllSessions()
    load()
  }

  return (
    <div>
      <h3>Sessions</h3>
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      {items.length > 0 && (
        <button onClick={revokeAll} style={{ marginBottom: '0.5rem' }}>
          Revoke All
        </button>
      )}
      <ul>
        {items.map((s) => (
          <li key={s.id} style={{ marginBottom: '0.5rem' }}>
            <span>{s.userAgent || 'Unknown device'}</span>
            <button onClick={() => revoke(s.id)} style={{ marginLeft: '0.5rem' }}>
              Revoke
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
