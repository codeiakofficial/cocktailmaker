import { render, screen, act } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import AgentProvider, { useAgents } from './AgentContext'

// Capture the EventSource instance so tests can emit events into it
let eventSourceInstance: {
  listeners: Record<string, ((e: MessageEvent) => void)[]>
  onerror: (() => void) | null
  close: () => void
  emit: (name: string, data: object) => void
}

class MockEventSource {
  listeners: Record<string, ((e: MessageEvent) => void)[]> = {}
  onerror: (() => void) | null = null

  constructor(_url: string) {
    this.listeners = {}
    eventSourceInstance = this as typeof eventSourceInstance
  }

  addEventListener(name: string, fn: (e: MessageEvent) => void) {
    this.listeners[name] = this.listeners[name] ?? []
    this.listeners[name].push(fn)
  }

  emit(name: string, data: object) {
    this.listeners[name]?.forEach(fn =>
      fn({ data: JSON.stringify(data) } as MessageEvent)
    )
  }

  close = vi.fn()
}

vi.stubGlobal('EventSource', MockEventSource)

// Minimal consumer that renders current agent status
function StatusDisplay() {
  const { agents } = useAgents()
  return (
    <>
      {agents.map(a => (
        <span key={a.id} data-testid={`agent-${a.agentId}`}>
          {a.isOnline ? 'online' : 'offline'}
        </span>
      ))}
    </>
  )
}

const onlineAgent = { id: 1, name: 'Dispenser 1', agentId: 'dispenser-1', isOnline: true, lastSeen: null }

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve([onlineAgent]),
  }))
})

describe('AgentContext — real-time SSE updates', () => {
  test('agent status updates to offline when SSE event arrives', async () => {
    render(<AgentProvider><StatusDisplay /></AgentProvider>)

    // Wait for initial fetch to populate agents
    expect(await screen.findByText('online')).toBeInTheDocument()

    // Simulate backend broadcasting agent offline (e.g. via MQTT LWT)
    act(() => {
      eventSourceInstance.emit('agent-status', {
        agentId: 'dispenser-1',
        isOnline: false,
        lastSeen: '2026-05-14T12:00:00Z',
      })
    })

    expect(screen.getByTestId('agent-dispenser-1')).toHaveTextContent('offline')
  })

  test('agent status updates to online when SSE event arrives', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ ...onlineAgent, isOnline: false }]),
    }))

    render(<AgentProvider><StatusDisplay /></AgentProvider>)

    expect(await screen.findByText('offline')).toBeInTheDocument()

    act(() => {
      eventSourceInstance.emit('agent-status', {
        agentId: 'dispenser-1',
        isOnline: true,
        lastSeen: '2026-05-14T12:01:00Z',
      })
    })

    expect(screen.getByTestId('agent-dispenser-1')).toHaveTextContent('online')
  })

  test('closes EventSource on unmount', async () => {
    const { unmount } = render(<AgentProvider><StatusDisplay /></AgentProvider>)
    await screen.findByText('online')
    unmount()
    expect(eventSourceInstance.close).toHaveBeenCalled()
  })
})
