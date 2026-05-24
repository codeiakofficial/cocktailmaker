import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import SettingsPage from './SettingsPage'

const mockSetTheme = vi.fn()
vi.mock('../theme-provider', () => ({
  useTheme: () => ({ theme: 'dark', setTheme: mockSetTheme }),
}))

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('localStorage', {
    getItem: vi.fn().mockReturnValue(null),
    setItem: vi.fn(),
  })
  document.documentElement.style.cssText = ''
})

describe('SettingsPage — appearance modes', () => {
  test('renders Light, Dark and Custom buttons', () => {
    render(<SettingsPage />)
    expect(screen.getByRole('button', { name: /light/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dark/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /custom/i })).toBeInTheDocument()
  })

  test('clicking Dark calls setTheme with "dark"', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)
    await user.click(screen.getByRole('button', { name: /^dark$/i }))
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  test('clicking Light calls setTheme with "light"', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)
    await user.click(screen.getByRole('button', { name: /^light$/i }))
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  test('clicking Custom calls setTheme with "light" (light as base)', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)
    await user.click(screen.getByRole('button', { name: /^custom$/i }))
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })
})

describe('SettingsPage — color pickers', () => {
  test('renders all color picker rows', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Button color')).toBeInTheDocument()
    expect(screen.getByText('Button hover')).toBeInTheDocument()
    expect(screen.getByText('Muted hover')).toBeInTheDocument()
    expect(screen.getByText('Background')).toBeInTheDocument()
    expect(screen.getByText('Font color')).toBeInTheDocument()
    expect(screen.getByText('Muted text')).toBeInTheDocument()
    expect(screen.getByText('Title color')).toBeInTheDocument()
    expect(screen.getByText('Border color')).toBeInTheDocument()
  })

  test('color inputs are disabled when not in custom mode', () => {
    render(<SettingsPage />)
    const inputs = screen.getAllByDisplayValue(/^#/)
    inputs.forEach(input => expect(input).toBeDisabled())
  })

  test('color inputs are enabled after switching to Custom', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)
    await user.click(screen.getByRole('button', { name: /^custom$/i }))
    const inputs = screen.getAllByDisplayValue(/^#/)
    inputs.forEach(input => expect(input).toBeEnabled())
  })
})

describe('SettingsPage — font selection', () => {
  test('renders all font buttons', () => {
    render(<SettingsPage />)
    expect(screen.getByRole('button', { name: 'Oxanium' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pacifico' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lobster' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dancing' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Righteous' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Abril' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Satisfy' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Playfair' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mono' })).toBeInTheDocument()
  })

  test('selecting a font does not switch to Custom mode', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)
    await user.click(screen.getByRole('button', { name: 'Pacifico' }))
    // mode button for Dark should still be active (border-primary class)
    expect(screen.getByRole('button', { name: /^dark$/i })).toHaveAttribute('data-active', 'true')
  })
})
