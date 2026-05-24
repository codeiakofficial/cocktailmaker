import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import SettingsPage from './SettingsPage'

vi.mock('./IngredientsSettings', () => ({ default: () => <div>ingredients-content</div> }))
vi.mock('./AgentsSettings',     () => ({ default: () => <div>agents-content</div> }))
vi.mock('./AppearanceSettings', () => ({ default: () => <div>appearance-content</div> }))

describe('SettingsPage — tabs', () => {
  test('renders Ingredients, Agents and Appearance tab buttons', () => {
    render(<SettingsPage />)
    expect(screen.getByRole('button', { name: /^ingredients$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^agents$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^appearance$/i })).toBeInTheDocument()
  })

  test('Ingredients tab is active by default', () => {
    render(<SettingsPage />)
    expect(screen.getByRole('button', { name: /^ingredients$/i })).toHaveAttribute('data-active', 'true')
    expect(screen.getByRole('button', { name: /^agents$/i })).toHaveAttribute('data-active', 'false')
    expect(screen.getByRole('button', { name: /^appearance$/i })).toHaveAttribute('data-active', 'false')
  })

  test('shows Ingredients content by default', () => {
    render(<SettingsPage />)
    expect(screen.getByText('ingredients-content')).toBeInTheDocument()
    expect(screen.queryByText('agents-content')).not.toBeInTheDocument()
    expect(screen.queryByText('appearance-content')).not.toBeInTheDocument()
  })

  test('clicking Agents shows agents content and hides others', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)
    await user.click(screen.getByRole('button', { name: /^agents$/i }))
    expect(screen.getByText('agents-content')).toBeInTheDocument()
    expect(screen.queryByText('ingredients-content')).not.toBeInTheDocument()
    expect(screen.queryByText('appearance-content')).not.toBeInTheDocument()
  })

  test('clicking Appearance shows appearance content and hides others', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)
    await user.click(screen.getByRole('button', { name: /^appearance$/i }))
    expect(screen.getByText('appearance-content')).toBeInTheDocument()
    expect(screen.queryByText('ingredients-content')).not.toBeInTheDocument()
    expect(screen.queryByText('agents-content')).not.toBeInTheDocument()
  })

  test('active tab button updates on click', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)
    await user.click(screen.getByRole('button', { name: /^agents$/i }))
    expect(screen.getByRole('button', { name: /^agents$/i })).toHaveAttribute('data-active', 'true')
    expect(screen.getByRole('button', { name: /^ingredients$/i })).toHaveAttribute('data-active', 'false')
  })

  test('only one tab is active at a time', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)
    await user.click(screen.getByRole('button', { name: /^appearance$/i }))
    const active = screen.getAllByRole('button').filter(b => b.getAttribute('data-active') === 'true')
    expect(active).toHaveLength(1)
  })
})
