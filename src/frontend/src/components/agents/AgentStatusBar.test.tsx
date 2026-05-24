import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, expect, test, vi, beforeEach } from 'vitest'
import { AgentStatusBar } from './AgentStatusBar'
import { AgentContext } from '../../contexts/AgentContext'
import type { AgentContextType } from '../../contexts/Agent'

// Minimal wrapper that supplies the context value directly, bypassing fetch / EventSource
function renderWithAgents(value: AgentContextType) {
  return render(
    <AgentContext.Provider value={value}>
      <AgentStatusBar />
    </AgentContext.Provider>
  )
}

describe('AgentStatusBar', () => {
  beforeEach(() => {
    // Suppress console.error noise from EventSource stubs in other tests
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  const noopContext = {
    agentPumps: {},
    fetchAgents: async () => {},
    dispense: async () => {},
    fetchAgentPumps: async () => {},
    updateAgentName: async () => {},
    updateAgentPumps: async () => {},
  }

  test('renders nothing when agents list is empty', () => {
    const { container } = renderWithAgents({ agents: [], ...noopContext })
    expect(container.firstChild).toBeNull()
  })

  test('shows agent name for each agent', () => {
    renderWithAgents({
      agents: [
        { id: 1, name: 'Dispenser 1', agentId: 'dispenser-1', isOnline: true, lastSeen: null },
        { id: 2, name: 'Dispenser 2', agentId: 'dispenser-2', isOnline: false, lastSeen: '2026-05-14T13:00:00Z' },
      ],
      ...noopContext,
    })
    expect(screen.getByText('Dispenser 1')).toBeInTheDocument()
    expect(screen.getByText('Dispenser 2')).toBeInTheDocument()
  })

  test('online agent dot has green class', () => {
    renderWithAgents({
      agents: [
        { id: 1, name: 'Dispenser 1', agentId: 'dispenser-1', isOnline: true, lastSeen: null },
      ],
      ...noopContext,
    })
    const dot = screen.getByLabelText('online')
    expect(dot).toHaveClass('bg-green-500')
  })

  test('offline agent dot has red class', () => {
    renderWithAgents({
      agents: [
        { id: 1, name: 'Dispenser 1', agentId: 'dispenser-1', isOnline: false, lastSeen: null },
      ],
      ...noopContext,
    })
    const dot = screen.getByLabelText('offline')
    expect(dot).toHaveClass('bg-red-500')
  })
})
