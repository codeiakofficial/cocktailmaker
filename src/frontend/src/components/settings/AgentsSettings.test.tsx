import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { AgentContext } from '../../contexts/AgentContext'
import { IngredientContext } from '../../contexts/IngredientContext'
import type { AgentContextType } from '../../contexts/Agent'
import type { IngredientContextType } from '../../contexts/Ingredient'
import AgentsSettings from './AgentsSettings'

const noopAgent: AgentContextType = {
  agents: [],
  agentPumps: {},
  fetchAgents: vi.fn(),
  dispense: async () => {},
  fetchAgentPumps: vi.fn(),
  updateAgentName: vi.fn(),
  updateAgentPumps: vi.fn(),
}

const ingredientCtx: IngredientContextType = {
  ingredients: [
    { id: 1, name: 'Rum',  usedInRecipes: [] },
    { id: 2, name: 'Cola', usedInRecipes: [] },
  ],
  fetchIngredients: vi.fn(),
  deleteIngredient: vi.fn(),
}

function renderPage(agentCtx: Partial<AgentContextType> = {}) {
  return render(
    <IngredientContext.Provider value={ingredientCtx}>
      <AgentContext.Provider value={{ ...noopAgent, ...agentCtx }}>
        <AgentsSettings />
      </AgentContext.Provider>
    </IngredientContext.Provider>
  )
}

const agent1 = { id: 1, name: 'Dispenser 1', agentId: 'dispenser-1', isOnline: true, lastSeen: null }
const emptyPumps = { 1: Array.from({ length: 8 }, (_, i) => ({ pumpIndex: i, ingredientId: null, ingredientName: null })) }

beforeEach(() => { vi.clearAllMocks() })

describe('AgentsSettings — rendering', () => {
  test('renders each agent name', () => {
    renderPage({ agents: [agent1] })
    expect(screen.getByText('Dispenser 1')).toBeInTheDocument()
  })

  test('shows a rename input prefilled with current name', () => {
    renderPage({ agents: [agent1] })
    expect(screen.getByDisplayValue('Dispenser 1')).toBeInTheDocument()
  })

  test('shows 8 pump slots per agent', () => {
    renderPage({ agents: [agent1], agentPumps: emptyPumps })
    expect(screen.getAllByTestId(/^pump-slot-/)).toHaveLength(8)
  })
})

describe('AgentsSettings — Save Changes button', () => {
  test('is disabled when nothing has changed', () => {
    renderPage({ agents: [agent1], agentPumps: emptyPumps })
    expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled()
  })

  test('is enabled when the name input is edited', async () => {
    const user = userEvent.setup()
    renderPage({ agents: [agent1], agentPumps: emptyPumps })
    await user.clear(screen.getByDisplayValue('Dispenser 1'))
    await user.type(screen.getByRole('textbox'), 'Bar Bot')
    expect(screen.getByRole('button', { name: /save changes/i })).toBeEnabled()
  })

  test('is enabled when a pump selection changes', async () => {
    const user = userEvent.setup()
    renderPage({ agents: [agent1], agentPumps: emptyPumps })
    await user.selectOptions(screen.getAllByRole('combobox')[0], '1')
    expect(screen.getByRole('button', { name: /save changes/i })).toBeEnabled()
  })

  test('is disabled again after name is restored to original', async () => {
    const user = userEvent.setup()
    renderPage({ agents: [agent1], agentPumps: emptyPumps })
    const input = screen.getByDisplayValue('Dispenser 1')
    await user.clear(input)
    await user.type(input, 'Bar Bot')
    await user.clear(input)
    await user.type(input, 'Dispenser 1')
    expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled()
  })
})

describe('AgentsSettings — saving', () => {
  test('calls updateAgentName when only name changed', async () => {
    const updateAgentName = vi.fn()
    const updateAgentPumps = vi.fn()
    const user = userEvent.setup()
    renderPage({ agents: [agent1], agentPumps: emptyPumps, updateAgentName, updateAgentPumps })
    await user.clear(screen.getByDisplayValue('Dispenser 1'))
    await user.type(screen.getByRole('textbox'), 'Bar Bot')
    await user.click(screen.getByRole('button', { name: /save changes/i }))
    expect(updateAgentName).toHaveBeenCalledWith(1, 'Bar Bot')
    expect(updateAgentPumps).not.toHaveBeenCalled()
  })

  test('calls updateAgentPumps when only a pump changed', async () => {
    const updateAgentName = vi.fn()
    const updateAgentPumps = vi.fn()
    const user = userEvent.setup()
    renderPage({ agents: [agent1], agentPumps: emptyPumps, updateAgentName, updateAgentPumps })
    await user.selectOptions(screen.getAllByRole('combobox')[0], '1')
    await user.click(screen.getByRole('button', { name: /save changes/i }))
    expect(updateAgentPumps).toHaveBeenCalledWith(1, expect.any(Array))
    expect(updateAgentName).not.toHaveBeenCalled()
  })

  test('calls both when name and pump both changed', async () => {
    const updateAgentName = vi.fn()
    const updateAgentPumps = vi.fn()
    const user = userEvent.setup()
    renderPage({ agents: [agent1], agentPumps: emptyPumps, updateAgentName, updateAgentPumps })
    await user.clear(screen.getByDisplayValue('Dispenser 1'))
    await user.type(screen.getByRole('textbox'), 'Bar Bot')
    await user.selectOptions(screen.getAllByRole('combobox')[0], '2')
    await user.click(screen.getByRole('button', { name: /save changes/i }))
    expect(updateAgentName).toHaveBeenCalledWith(1, 'Bar Bot')
    expect(updateAgentPumps).toHaveBeenCalledWith(1, expect.any(Array))
  })
})
