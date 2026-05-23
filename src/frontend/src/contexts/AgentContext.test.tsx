import { render, screen, act, waitFor } from '@testing-library/react'
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

// Consumer that calls fetchAgentPumps and shows the result
function PumpDisplay({ agentId }: { agentId: number }) {
  const { agentPumps, fetchAgentPumps } = useAgents()
  const pumps = agentPumps[agentId] ?? []
  return (
    <>
      <button onClick={() => fetchAgentPumps(agentId)}>load pumps</button>
      {pumps.map(p => (
        <span key={p.pumpIndex} data-testid={`pump-${p.pumpIndex}`}>
          {p.ingredientName ?? 'empty'}
        </span>
      ))}
    </>
  )
}

describe('AgentContext — pump operations', () => {
  const pumps = [
    { pumpIndex: 0, ingredientId: 1, ingredientName: 'Rum' },
    { pumpIndex: 1, ingredientId: null, ingredientName: null },
  ]

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('/pumps')) return Promise.resolve({ ok: true, json: () => Promise.resolve(pumps) })
      if (url.includes('/agents')) return Promise.resolve({ ok: true, json: () => Promise.resolve([onlineAgent]) })
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    }))
  })

  test('fetchAgentPumps stores pump list keyed by agent id', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    render(<AgentProvider><PumpDisplay agentId={1} /></AgentProvider>)

    await user.click(await screen.findByRole('button', { name: 'load pumps' }))

    await waitFor(() => expect(screen.getByTestId('pump-0')).toHaveTextContent('Rum'))
    expect(screen.getByTestId('pump-1')).toHaveTextContent('empty')
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(expect.stringContaining('/agents/1/pumps'))
  })

  test('updateAgentName PATCHes the correct endpoint', async () => {
    function RenameButton() {
      const { updateAgentName } = useAgents()
      return <button onClick={() => updateAgentName(1, 'New Name')}>rename</button>
    }
    const user = (await import('@testing-library/user-event')).default.setup()
    render(<AgentProvider><RenameButton /></AgentProvider>)

    await user.click(await screen.findByRole('button', { name: 'rename' }))

    await waitFor(() => {
      const calls = vi.mocked(fetch).mock.calls
      const patchCall = calls.find(([url, opts]) =>
        String(url).includes('/agents/1') && (opts as RequestInit)?.method === 'PATCH'
      )
      expect(patchCall).toBeDefined()
    })
  })

  test('updateAgentPumps PUTs to the correct endpoint', async () => {
    function SaveButton() {
      const { updateAgentPumps } = useAgents()
      return (
        <button onClick={() => updateAgentPumps(1, [{ pumpIndex: 0, ingredientId: 2 }])}>
          save
        </button>
      )
    }
    const user = (await import('@testing-library/user-event')).default.setup()
    render(<AgentProvider><SaveButton /></AgentProvider>)

    await user.click(await screen.findByRole('button', { name: 'save' }))

    await waitFor(() => {
      const calls = vi.mocked(fetch).mock.calls
      const putCall = calls.find(([url, opts]) =>
        String(url).includes('/agents/1/pumps') && (opts as RequestInit)?.method === 'PUT'
      )
      expect(putCall).toBeDefined()
    })
  })
})
