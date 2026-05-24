import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { describe, expect, test, vi, beforeEach } from 'vitest'
import { NewRecipeDialog } from './NewRecipeDialog'
import { RecipeContext } from '../../contexts/RecipeContext'
import type { RecipeContextType } from '../../contexts/Recipe'

function renderDialog(overrides: Partial<RecipeContextType> = {}) {
  const context: RecipeContextType = {
    recipes: [],
    fetchRecipes: vi.fn(),
    saveRecipe: vi.fn(),
    updateRecipe: vi.fn(),
    deleteRecipe: vi.fn(),
    ...overrides,
  }
  render(
    <RecipeContext.Provider value={context}>
      <NewRecipeDialog />
    </RecipeContext.Provider>
  )
  return context
}

describe('NewRecipeDialog', () => {
  beforeEach(() => { vi.clearAllMocks() })

  test('renders image URL input in dialog', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: 'New Recipe' }))
    expect(screen.getByPlaceholderText(/image url/i)).toBeInTheDocument()
  })

  test('uploading an image calls POST /api/images and stores the url', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: 'http://localhost:8080/uploads/cocktail.jpg' }),
    }))
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: 'New Recipe' }))
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(fileInput, new File(['data'], 'cocktail.jpg', { type: 'image/jpeg' }))
    expect(screen.getByDisplayValue('http://localhost:8080/uploads/cocktail.jpg')).toBeInTheDocument()
  })

  test('opens dialog on trigger click', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'New Recipe' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  test('adds an ingredient and shows it in the list', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'New Recipe' }))
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await user.type(screen.getByPlaceholderText('Enter the ingredients'), 'Vodka')

    expect(screen.getByDisplayValue('Vodka')).toBeInTheDocument()
    expect(screen.getByText('1.')).toBeInTheDocument()
  })

  test('removes an ingredient on ✕ click', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'New Recipe' }))
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await user.type(screen.getByPlaceholderText('Enter the ingredients'), 'Gin')
    await user.click(screen.getByRole('button', { name: '✕' }))

    expect(screen.queryByDisplayValue('Gin')).not.toBeInTheDocument()
  })

  test('Next is disabled until name and at least one ingredient are filled', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'New Recipe' }))

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Add' }))
    await user.type(screen.getByPlaceholderText('Enter the ingredients'), 'Rum')
    await user.type(screen.getByLabelText(/name/i), 'Mojito')

    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled()
  })
})
