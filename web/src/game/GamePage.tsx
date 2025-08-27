import React, { useEffect, useRef, useState } from 'react'
import { getGame } from '../api'

type GamePageProps = {
  gameId: number
}

type GameState = {
  participants: string[]
  waitlist: string[]
}

type RoomEvent = {
  type: string
  data: { [key: string]: any }
}

function patchState(prev: GameState, evt: RoomEvent): GameState {
  switch (evt.type) {
    case 'participant_joined':
      return { ...prev, participants: [...prev.participants, evt.data.user] }
    case 'participant_left':
      return {
        ...prev,
        participants: prev.participants.filter((u) => u !== evt.data.user),
      }
    case 'waitlist_joined':
      return { ...prev, waitlist: [...prev.waitlist, evt.data.user] }
    case 'waitlist_promoted':
      return {
        participants: [...prev.participants, evt.data.user],
        waitlist: prev.waitlist.filter((u) => u !== evt.data.user),
      }
    default:
      return prev
  }
}

export default function GamePage({ gameId }: GamePageProps) {
  const [state, setState] = useState<GameState>({ participants: [], waitlist: [] })
  const wsRef = useRef<WebSocket | null>(null)
  const retryRef = useRef<number>()

  useEffect(() => {
    connect()
    return () => {
      wsRef.current?.close()
      if (retryRef.current) window.clearTimeout(retryRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId])

  const connect = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const ws = new WebSocket(`${protocol}://${window.location.host}/ws`)
    wsRef.current = ws

    ws.onopen = () => {
      // STOMP connect and subscribe to game topic
      ws.send('CONNECT\n\n\0')
      ws.send(
        `SUBSCRIBE\nid:sub-${gameId}\ndestination:/topic/games/${gameId}\n\n\0`
      )
    }

    ws.onmessage = (e) => {
      try {
        // STOMP frame: separate headers and body
        const payload = e.data as string
        const idx = payload.indexOf('\n\n')
        const body = idx >= 0 ? payload.slice(idx + 2, -1) : payload
        const evt: RoomEvent = JSON.parse(body)
        setState((prev) => patchState(prev, evt))
      } catch {
        /* ignore */
      }
    }

    ws.onclose = () => {
      retryRef.current = window.setTimeout(async () => {
        try {
          const g = await getGame(gameId)
          setState({
            participants: g.participants || [],
            waitlist: g.waitlist || [],
          })
        } catch {
          /* ignore */
        }
        connect()
      }, 1000)
    }

    ws.onerror = () => {
      ws.close()
    }
  }

  return (
    <div>
      <h2>Participants</h2>
      <ul>
        {state.participants.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <h2>Waitlist</h2>
      <ul>
        {state.waitlist.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </div>
  )
}

