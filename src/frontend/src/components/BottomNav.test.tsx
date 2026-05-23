import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import BottomNav from './BottomNav'

function renderNav(page: number, overrides: Partial<Parameters<typeof BottomNav>[0]> = {}) {
  return render(
    <BottomNav
      page={page}
      onHome={vi.fn()}
      onIngredients={vi.fn()}
      onAgents={vi.fn()}
      newRecipeTrigger={<button>New Recipe</button>}
      {...overrides}
    />
  )
}

describe('BottomNav — rendering', () => {
  test('renders Home, Ingredients and Agents tabs', () => {
    renderNav(0)
    expect(screen.getByRole('button', { name: /home/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ingredients/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /agents/i })).toBeInTheDocument()
  })

  test('renders the newRecipeTrigger slot', () => {
    renderNav(0)
    expect(screen.getByRole('button', { name: /new recipe/i })).toBeInTheDocument()
  })
})

describe('BottomNav — active state', () => {
  test('Home tab is active when page is 0', () => {
    renderNav(0)
    expect(screen.getByRole('button', { name: /home/i })).toHaveAttribute('data-active', 'true')
  })

  test('Ingredients tab is active when page is 1', () => {
    renderNav(1)
    expect(screen.getByRole('button', { name: /ingredients/i })).toHaveAttribute('data-active', 'true')
  })

  test('Agents tab is active when page is 2', () => {
    renderNav(2)
    expect(screen.getByRole('button', { name: /agents/i })).toHaveAttribute('data-active', 'true')
  })

  test('only one tab is active at a time', () => {
    renderNav(1)
    const active = screen.getAllByRole('button').filter(b => b.getAttribute('data-active') === 'true')
    expect(active).toHaveLength(1)
  })
})

describe('BottomNav — navigation', () => {
  test('clicking Home calls onHome', async () => {
    const onHome = vi.fn()
    const user = userEvent.setup()
    renderNav(1, { onHome })
    await user.click(screen.getByRole('button', { name: /home/i }))
    expect(onHome).toHaveBeenCalledOnce()
  })

  test('clicking Ingredients calls onIngredients', async () => {
    const onIngredients = vi.fn()
    const user = userEvent.setup()
    renderNav(0, { onIngredients })
    await user.click(screen.getByRole('button', { name: /ingredients/i }))
    expect(onIngredients).toHaveBeenCalledOnce()
  })

  test('clicking Agents calls onAgents', async () => {
    const onAgents = vi.fn()
    const user = userEvent.setup()
    renderNav(0, { onAgents })
    await user.click(screen.getByRole('button', { name: /agents/i }))
    expect(onAgents).toHaveBeenCalledOnce()
  })
})
