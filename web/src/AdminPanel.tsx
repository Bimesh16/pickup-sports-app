import React, { useState } from 'react'
import {
  promoteWaitlist,
  kickParticipant,
  banParticipant,
  addCohost,
  removeCohost,
  generateInviteToken,
} from './api'

export default function AdminPanel() {
  const [gameId, setGameId] = useState('')
  const [userId, setUserId] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const num = (v: string) => Number(v)

  return (
    <div style={{ borderTop: '1px solid #ccc', marginTop: '2rem', paddingTop: '1rem' }}>
      <h2>Game Admin</h2>
      <div>
        <input
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
          placeholder="Game ID"
          style={{ marginRight: '0.5rem' }}
        />
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="User ID"
        />
      </div>
      <div style={{ marginTop: '1rem' }}>
        <button onClick={async () => await promoteWaitlist(num(gameId), num(userId))}>Promote</button>
        <button onClick={async () => await kickParticipant(num(gameId), num(userId))}>Kick</button>
        <button onClick={async () => await banParticipant(num(gameId), num(userId))}>Ban</button>
        <button onClick={async () => await addCohost(num(gameId), num(userId))}>Add Co-host</button>
        <button onClick={async () => await removeCohost(num(gameId), num(userId))}>Remove Co-host</button>
        <button
          onClick={async () => {
            const t = await generateInviteToken(num(gameId))
            setToken(t)
          }}
        >
          Invite Token
        </button>
      </div>
      {token && <div style={{ marginTop: '0.5rem' }}>Token: {token}</div>}
    </div>
  )
}

