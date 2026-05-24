import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { CleanViewToggle } from './CleanViewToggle'

beforeEach(() => {
  document.documentElement.classList.remove('clean-view')
  vi.stubGlobal('localStorage', {
    getItem: vi.fn().mockReturnValue(null),
    setItem: vi.fn(),
  })
})

describe('CleanViewToggle', () => {
  test('renders a button with aria-label containing "clean view"', () => {
    render(<CleanViewToggle />)
    expect(screen.getByRole('button', { name: /clean view/i })).toBeInTheDocument()
  })

  test('aria-pressed is false by default', () => {
    render(<CleanViewToggle />)
    expect(screen.getByRole('button', { name: /clean view/i })).toHaveAttribute('aria-pressed', 'false')
  })

  test('clicking adds clean-view class to html', async () => {
    const user = userEvent.setup()
    render(<CleanViewToggle />)
    await user.click(screen.getByRole('button', { name: /clean view/i }))
    expect(document.documentElement.classList.contains('clean-view')).toBe(true)
  })

  test('clicking again removes clean-view class', async () => {
    const user = userEvent.setup()
    render(<CleanViewToggle />)
    await user.click(screen.getByRole('button', { name: /clean view/i }))
    await user.click(screen.getByRole('button', { name: /clean view/i }))
    expect(document.documentElement.classList.contains('clean-view')).toBe(false)
  })

  test('clicking sets aria-pressed to true', async () => {
    const user = userEvent.setup()
    render(<CleanViewToggle />)
    await user.click(screen.getByRole('button', { name: /clean view/i }))
    expect(screen.getByRole('button', { name: /clean view/i })).toHaveAttribute('aria-pressed', 'true')
  })

  test('persists to localStorage on toggle', async () => {
    const user = userEvent.setup()
    render(<CleanViewToggle />)
    await user.click(screen.getByRole('button', { name: /clean view/i }))
    expect(localStorage.setItem).toHaveBeenCalledWith('vite-ui-clean-view', 'true')
  })

  test('initialises from localStorage', () => {
    localStorage.getItem = vi.fn((key: string) => key === 'vite-ui-clean-view' ? 'true' : null)
    render(<CleanViewToggle />)
    expect(screen.getByRole('button', { name: /clean view/i })).toHaveAttribute('aria-pressed', 'true')
  })
})
