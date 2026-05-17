import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi, beforeEach } from 'vitest'
import { RecipeCarousel } from './RecipeCarousel'
import { RecipeContext } from '../../contexts/RecipeContext'
import { AgentContext } from '../../contexts/AgentContext'
import type { RecipeContextType, IRecipe } from '../../contexts/Recipe'
import type { AgentContextType } from '../../contexts/Agent'


const recipe: IRecipe = {
  id: 1,
  name: 'Mojito',
  recipeIngredients: [{ name: 'Rum', quantity: 50, unit: 'ml' }],
}

function renderCarousel(agents: AgentContextType['agents'], dispense = vi.fn()) {
  const recipeCtx: RecipeContextType = {
    recipes: [recipe],
    fetchRecipes: vi.fn(),
    saveRecipe: vi.fn(),
    updateRecipe: vi.fn(),
    deleteRecipe: vi.fn(),
  }
  const agentCtx: AgentContextType = { agents, dispense }

  render(
    <RecipeContext.Provider value={recipeCtx}>
      <AgentContext.Provider value={agentCtx}>
        <RecipeCarousel />
      </AgentContext.Provider>
    </RecipeContext.Provider>
  )
  return { dispense }
}

describe('RecipeCarousel — Dispense button', () => {
  beforeEach(() => { vi.clearAllMocks() })

  test('disabled when no agents are online', () => {
    renderCarousel([{ id: 1, name: 'Dispenser 1', agentId: 'dispenser-1', isOnline: false, lastSeen: null }])
    expect(screen.getByRole('button', { name: 'Dispense' })).toBeDisabled()
  })

  test('disabled when agents list is empty', () => {
    renderCarousel([])
    expect(screen.getByRole('button', { name: 'Dispense' })).toBeDisabled()
  })

  test('enabled when an agent is online', () => {
    renderCarousel([{ id: 1, name: 'Dispenser 1', agentId: 'dispenser-1', isOnline: true, lastSeen: null }])
    expect(screen.getByRole('button', { name: 'Dispense' })).toBeEnabled()
  })

  test('calls dispense with the recipe id on click', async () => {
    const user = userEvent.setup()
    const { dispense } = renderCarousel([
      { id: 1, name: 'Dispenser 1', agentId: 'dispenser-1', isOnline: true, lastSeen: null },
    ])

    await user.click(screen.getByRole('button', { name: 'Dispense' }))

    expect(dispense).toHaveBeenCalledOnce()
    expect(dispense).toHaveBeenCalledWith(recipe.id)
  })
})
