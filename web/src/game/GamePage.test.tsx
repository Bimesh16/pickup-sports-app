import React from 'react'
import ReactDOM from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import GamePage from './GamePage'

jest.useFakeTimers()

class MockWebSocket {
  static instances: MockWebSocket[] = []
  onopen: (() => void) | null = null
  onclose: (() => void) | null = null
  onmessage: ((ev: { data: string }) => void) | null = null
  url: string

  constructor(url: string) {
    this.url = url
    MockWebSocket.instances.push(this)
    setTimeout(() => this.onopen && this.onopen(), 0)
  }

  send(_data: string) {}
  close() {
    this.onclose && this.onclose()
  }
}

;(global as any).WebSocket = MockWebSocket as any

describe('GamePage reconnect', () => {
  beforeEach(() => {
    MockWebSocket.instances = []
    ;(global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        participants: ['alice', 'bob'],
        waitlist: ['carol'],
      }),
    })
  })

  it('reconnects and backfills missed messages', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    await act(async () => {
      ReactDOM.createRoot(container).render(<GamePage gameId={1} />)
    })

    const ws = MockWebSocket.instances[0]
    act(() => {
      ws.onmessage?.({
        data: JSON.stringify({
          type: 'participant_joined',
          data: { user: 'alice' },
        }),
      })
    })
    expect(container.textContent).toContain('alice')

    act(() => {
      ws.close()
    })

    await act(async () => {
      jest.runAllTimers()
    })
    await Promise.resolve()

    expect((global as any).fetch).toHaveBeenCalledWith('/games/1')
    expect(container.textContent).toContain('bob')
    expect(container.textContent).toContain('carol')
    expect(MockWebSocket.instances.length).toBeGreaterThan(1)
  })
})

