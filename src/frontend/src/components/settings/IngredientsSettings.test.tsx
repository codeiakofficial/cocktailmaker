import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { IngredientContext } from '../../contexts/IngredientContext'
import { RecipeContext } from '../../contexts/RecipeContext'
import type { IngredientContextType } from '../../contexts/Ingredient'
import type { RecipeContextType } from '../../contexts/Recipe'
import IngredientsSettings from './IngredientsSettings'

const recipeCtx: RecipeContextType = {
  recipes: [],
  fetchRecipes: vi.fn(),
  saveRecipe: vi.fn(),
  updateRecipe: vi.fn(),
  deleteRecipe: vi.fn(),
}

const ingredientCtx: IngredientContextType = {
  ingredients: [
    { id: 1, name: 'Rum',  usedInRecipes: [] },
    { id: 2, name: 'Cola', usedInRecipes: [] },
  ],
  fetchIngredients: vi.fn(),
  deleteIngredient: vi.fn(),
}

function renderPage(ctx: Partial<IngredientContextType> = {}) {
  return render(
    <RecipeContext.Provider value={recipeCtx}>
      <IngredientContext.Provider value={{ ...ingredientCtx, ...ctx }}>
        <IngredientsSettings />
      </IngredientContext.Provider>
    </RecipeContext.Provider>
  )
}

describe('IngredientsSettings', () => {
  test('renders ingredient names from context', () => {
    renderPage()
    expect(screen.getByText('Rum')).toBeInTheDocument()
    expect(screen.getByText('Cola')).toBeInTheDocument()
  })

  test('renders empty state when no ingredients', () => {
    renderPage({ ingredients: [] })
    expect(screen.queryByText('Rum')).not.toBeInTheDocument()
  })
})
