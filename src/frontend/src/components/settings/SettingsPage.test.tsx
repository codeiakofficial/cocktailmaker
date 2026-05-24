import { render, screen, fireEvent } from '@testing-library/react'
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

describe('SettingsPage — CSS variable side-effects', () => {
  test('switching to Custom writes all state values as CSS vars', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)
    await user.click(screen.getByRole('button', { name: /^custom$/i }))
    const style = document.documentElement.style
    expect(style.getPropertyValue('--primary')).toBe('#d4274a')
    expect(style.getPropertyValue('--primary-hover')).toBe('#a01e38')
    expect(style.getPropertyValue('--muted-hover')).toBe('#2e2e4a')
    expect(style.getPropertyValue('--background')).toBe('#1a1a2e')
  })

  test('switching to Light applies tropical palette CSS vars', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)
    await user.click(screen.getByRole('button', { name: /^light$/i }))
    const style = document.documentElement.style
    expect(style.getPropertyValue('--background')).toBe('#fef9ec')
    expect(style.getPropertyValue('--primary')).toBe('#e67e22')
    expect(style.getPropertyValue('--title-color')).toBe('#c0392b')
  })

  test('switching to Dark clears all custom CSS vars', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)
    await user.click(screen.getByRole('button', { name: /^custom$/i }))
    await user.click(screen.getByRole('button', { name: /^dark$/i }))
    const style = document.documentElement.style
    expect(style.getPropertyValue('--primary')).toBe('')
    expect(style.getPropertyValue('--background')).toBe('')
    expect(style.getPropertyValue('--primary-hover')).toBe('')
    expect(style.getPropertyValue('--muted-hover')).toBe('')
  })

  test('changing button hover color sets --primary-hover', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)
    await user.click(screen.getByRole('button', { name: /^custom$/i }))
    const inputs = screen.getAllByDisplayValue(/^#/)
    fireEvent.change(inputs[1], { target: { value: '#ff1234' } })
    expect(document.documentElement.style.getPropertyValue('--primary-hover')).toBe('#ff1234')
  })

  test('changing muted hover color sets --muted-hover', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)
    await user.click(screen.getByRole('button', { name: /^custom$/i }))
    const inputs = screen.getAllByDisplayValue(/^#/)
    fireEvent.change(inputs[2], { target: { value: '#aabbcc' } })
    expect(document.documentElement.style.getPropertyValue('--muted-hover')).toBe('#aabbcc')
  })
})

describe('SettingsPage — font application', () => {
  test('selecting a font sets document fontFamily', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)
    await user.click(screen.getByRole('button', { name: 'Pacifico' }))
    expect(document.documentElement.style.fontFamily).toContain('Pacifico')
  })

  test('font is preserved when switching appearance modes', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)
    await user.click(screen.getByRole('button', { name: 'Pacifico' }))
    await user.click(screen.getByRole('button', { name: /^light$/i }))
    expect(document.documentElement.style.fontFamily).toContain('Pacifico')
    await user.click(screen.getByRole('button', { name: /^dark$/i }))
    expect(document.documentElement.style.fontFamily).toContain('Pacifico')
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
