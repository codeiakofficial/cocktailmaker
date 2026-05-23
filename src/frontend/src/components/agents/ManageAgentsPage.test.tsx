import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { AgentContext } from '../../contexts/AgentContext'
import { IngredientContext } from '../../contexts/IngredientContext'
import type { AgentContextType } from '../../contexts/Agent'
import type { IngredientContextType } from '../../contexts/Ingredient'
import ManageAgentsPage from './ManageAgentsPage'

const noopAgent: AgentContextType = {
  agents: [],
  agentPumps: {},
  dispense: async () => {},
  fetchAgentPumps: vi.fn(),
  updateAgentName: vi.fn(),
  updateAgentPumps: vi.fn(),
}

const ingredients: IngredientContextType = {
  ingredients: [
    { id: 1, name: 'Rum', usedInRecipes: [] },
    { id: 2, name: 'Cola', usedInRecipes: [] },
  ],
  fetchIngredients: vi.fn(),
  deleteIngredient: vi.fn(),
}

function renderPage(agentCtx: Partial<AgentContextType> = {}) {
  return render(
    <IngredientContext.Provider value={ingredients}>
      <AgentContext.Provider value={{ ...noopAgent, ...agentCtx }}>
        <ManageAgentsPage />
      </AgentContext.Provider>
    </IngredientContext.Provider>
  )
}

const agent1 = { id: 1, name: 'Dispenser 1', agentId: 'dispenser-1', isOnline: true, lastSeen: null }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ManageAgentsPage', () => {
  test('renders each agent name', () => {
    renderPage({ agents: [agent1] })
    expect(screen.getByText('Dispenser 1')).toBeInTheDocument()
  })

  test('shows a rename input prefilled with current name', () => {
    renderPage({ agents: [agent1] })
    const input = screen.getByDisplayValue('Dispenser 1')
    expect(input).toBeInTheDocument()
  })

  test('calls updateAgentName with new name when rename is submitted', async () => {
    const updateAgentName = vi.fn()
    renderPage({ agents: [agent1], updateAgentName })
    const user = userEvent.setup()

    const input = screen.getByDisplayValue('Dispenser 1')
    await user.clear(input)
    await user.type(input, 'Bar Bot')
    await user.click(screen.getByRole('button', { name: /rename/i }))

    expect(updateAgentName).toHaveBeenCalledWith(1, 'Bar Bot')
  })

  test('shows 8 pump slots for the selected agent', async () => {
    const fetchAgentPumps = vi.fn()
    renderPage({
      agents: [agent1],
      fetchAgentPumps,
      agentPumps: {
        1: Array.from({ length: 8 }, (_, i) => ({
          pumpIndex: i,
          ingredientId: null,
          ingredientName: null,
        })),
      },
    })

    const slots = screen.getAllByTestId(/^pump-slot-/)
    expect(slots).toHaveLength(8)
  })

  test('calls updateAgentPumps when save pumps is clicked', async () => {
    const updateAgentPumps = vi.fn()
    renderPage({
      agents: [agent1],
      updateAgentPumps,
      agentPumps: {
        1: [{ pumpIndex: 0, ingredientId: 1, ingredientName: 'Rum' }],
      },
    })
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /save pumps/i }))

    expect(updateAgentPumps).toHaveBeenCalledWith(1, expect.any(Array))
  })
})
