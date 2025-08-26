import React, { FormEvent, useEffect, useState } from 'react'
import {
  FeatureFlags,
  GamesPage,
  getFlags,
  getGames,
  login,
  createGame,
  setAuthToken,
} from './api'

export default function App() {
  const [flags, setFlags] = useState<FeatureFlags | null>(null)
  const [games, setGames] = useState<GamesPage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('accessToken')
  )

  const [newGame, setNewGame] = useState({
    sport: '',
    location: '',
    time: '',
    skillLevel: '',
  })

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
  }, [token])

  useEffect(() => {
    setAuthToken(token)
  }, [token])

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const pair = await login(username, password)
      localStorage.setItem('accessToken', pair.accessToken)
      setToken(pair.accessToken)
      setUsername('')
      setPassword('')
      setError(null)
    } catch (err: any) {
      setError(err.message ?? 'Login failed')
    }
  }

  const handleCreateGame = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await createGame({
        sport: newGame.sport,
        location: newGame.location,
        time: newGame.time,
        skillLevel: newGame.skillLevel || undefined,
      })
      const g = await getGames()
      setGames(g)
      setNewGame({ sport: '', location: '', time: '', skillLevel: '' })
      setError(null)
    } catch (err: any) {
      setError(err.message ?? 'Create game failed')
    }
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    setToken(null)
  }

  return (
    <div style={{ maxWidth: 720, margin: '2rem auto', fontFamily: 'system-ui, Arial' }}>
      <h1>Pickup Sports</h1>
      {error && <div style={{ color: 'crimson' }}>Error: {error}</div>}
      {flags && (
        <div style={{ padding: '0.5rem 0' }}>
          <strong>Env:</strong> {flags.env} • <strong>AI Recommend:</strong>{' '}
          {flags.recommend ? 'on' : 'off'} • <strong>Chat:</strong>{' '}
          {flags.chatEnabled ? 'on' : 'off'}
        </div>
      )}

      {!token ? (
        <form onSubmit={handleLogin} style={{ margin: '1rem 0' }}>
          <h2>Login</h2>
          <input
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button type="submit">Sign in</button>
        </form>
      ) : (
        <div>
          <button onClick={logout}>Logout</button>

          <form onSubmit={handleCreateGame} style={{ margin: '1rem 0' }}>
            <h2>Create Game</h2>
            <input
              placeholder="Sport"
              value={newGame.sport}
              onChange={e => setNewGame({ ...newGame, sport: e.target.value })}
            />
            <input
              placeholder="Location"
              value={newGame.location}
              onChange={e =>
                setNewGame({ ...newGame, location: e.target.value })
              }
            />
            <input
              type="datetime-local"
              value={newGame.time}
              onChange={e => setNewGame({ ...newGame, time: e.target.value })}
            />
            <input
              placeholder="Skill level"
              value={newGame.skillLevel}
              onChange={e =>
                setNewGame({ ...newGame, skillLevel: e.target.value })
              }
            />
            <button type="submit">Create</button>
          </form>
        </div>
      )}

      <h2>Explore Games</h2>
      {!games && !error && <div>Loading…</div>}
      {games && games.content && (
        <ul>
          {games.content.map(g => (
            <li key={g.id}>
              <strong>{g.sport}</strong> at {g.location} • {g.time}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

