import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import BottomNav from './BottomNav'

function renderNav(page: number, overrides: Partial<Parameters<typeof BottomNav>[0]> = {}) {
  return render(
    <BottomNav
      page={page}
      onHome={vi.fn()}
      onSettings={vi.fn()}
      {...overrides}
    />
  )
}

describe('BottomNav — rendering', () => {
  test('renders Home and Settings tabs only', () => {
    renderNav(0)
    expect(screen.getByRole('button', { name: /^home$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^settings$/i })).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(2)
  })
})

describe('BottomNav — active state', () => {
  test('Home tab is active when page is 0', () => {
    renderNav(0)
    expect(screen.getByRole('button', { name: /^home$/i })).toHaveAttribute('data-active', 'true')
    expect(screen.getByRole('button', { name: /^settings$/i })).toHaveAttribute('data-active', 'false')
  })

  test('Settings tab is active when page is 1', () => {
    renderNav(1)
    expect(screen.getByRole('button', { name: /^settings$/i })).toHaveAttribute('data-active', 'true')
    expect(screen.getByRole('button', { name: /^home$/i })).toHaveAttribute('data-active', 'false')
  })

  test('only one tab is active at a time', () => {
    renderNav(0)
    const active = screen.getAllByRole('button').filter(b => b.getAttribute('data-active') === 'true')
    expect(active).toHaveLength(1)
  })
})

describe('BottomNav — navigation', () => {
  test('clicking Home calls onHome', async () => {
    const onHome = vi.fn()
    const user = userEvent.setup()
    renderNav(1, { onHome })
    await user.click(screen.getByRole('button', { name: /^home$/i }))
    expect(onHome).toHaveBeenCalledOnce()
  })

  test('clicking Settings calls onSettings', async () => {
    const onSettings = vi.fn()
    const user = userEvent.setup()
    renderNav(0, { onSettings })
    await user.click(screen.getByRole('button', { name: /^settings$/i }))
    expect(onSettings).toHaveBeenCalledOnce()
  })
})
