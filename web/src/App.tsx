import React, { useEffect, useState } from 'react'
import { getFlags, getGames, joinGame, FeatureFlags } from './api'

export default function App() {
  const [flags, setFlags] = useState<FeatureFlags | null>(null)
  const [games, setGames] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleJoin = async (id: number) => {
    try {
      await joinGame(id)
      alert('Joined game')
    } catch (e: any) {
      if (e.message === 'captcha_required') {
        const token = window.prompt('CAPTCHA required. Enter token:')
        if (token) {
          try {
            await joinGame(id, token)
            alert('Joined game')
          } catch (err: any) {
            alert(err.message || 'Join failed')
          }
        }
      } else {
        alert(e.message || 'Join failed')
      }
    }
  }

  useEffect(() => {
    ;(async () => {
      try {
        const f = await getFlags()
        setFlags(f)
        const g = await getGames()
        setGames(g)
      } catch (e: any) {
        setError(e.message ?? 'Error')
      }
    })()
  }, [])

  return (
    <div style={{ maxWidth: 720, margin: '2rem auto', fontFamily: 'system-ui, Arial' }}>
      <h1>Pickup Sports</h1>
      {error && <div style={{ color: 'crimson' }}>Error: {error}</div>}
      {flags && (
        <div style={{ padding: '0.5rem 0' }}>
          <strong>Env:</strong> {flags.env} • <strong>AI Recommend:</strong> {flags.recommend ? 'on' : 'off'} •{' '}
          <strong>Chat:</strong> {flags.chatEnabled ? 'on' : 'off'}
        </div>
      )}
      <h2>Explore Games</h2>
      {!games && !error && <div>Loading…</div>}
      {games && games.content && (
        <ul>
          {games.content.map((g: any) => (
            <li key={g.id}>
              <strong>{g.sport}</strong> at {g.location} • {g.time}{' '}
              <button onClick={() => handleJoin(g.id)}>Join</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
