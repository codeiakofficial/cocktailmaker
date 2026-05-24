import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import AppearanceSettings from './AppearanceSettings'

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

describe('AppearanceSettings — mode buttons', () => {
  test('renders Light, Dark and Custom buttons', () => {
    render(<AppearanceSettings />)
    expect(screen.getByRole('button', { name: /^light$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^dark$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^custom$/i })).toBeInTheDocument()
  })

  test('clicking Dark calls setTheme with "dark"', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('button', { name: /^dark$/i }))
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  test('clicking Light calls setTheme with "light"', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('button', { name: /^light$/i }))
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  test('clicking Custom calls setTheme with "light"', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('button', { name: /^custom$/i }))
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })
})

describe('AppearanceSettings — color pickers', () => {
  test('renders all color picker rows', () => {
    render(<AppearanceSettings />)
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
    render(<AppearanceSettings />)
    screen.getAllByDisplayValue(/^#/).forEach(input => expect(input).toBeDisabled())
  })

  test('color inputs are enabled after switching to Custom', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('button', { name: /^custom$/i }))
    screen.getAllByDisplayValue(/^#/).forEach(input => expect(input).toBeEnabled())
  })
})

describe('AppearanceSettings — CSS variable side-effects', () => {
  test('switching to Custom writes all state values as CSS vars', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('button', { name: /^custom$/i }))
    const s = document.documentElement.style
    expect(s.getPropertyValue('--primary')).toBe('#d4274a')
    expect(s.getPropertyValue('--primary-hover')).toBe('#a01e38')
    expect(s.getPropertyValue('--muted-hover')).toBe('#2e2e4a')
    expect(s.getPropertyValue('--background')).toBe('#1a1a2e')
  })

  test('switching to Light applies tropical palette CSS vars', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('button', { name: /^light$/i }))
    const s = document.documentElement.style
    expect(s.getPropertyValue('--background')).toBe('#fef9ec')
    expect(s.getPropertyValue('--primary')).toBe('#e67e22')
    expect(s.getPropertyValue('--title-color')).toBe('#c0392b')
  })

  test('switching to Dark clears all custom CSS vars', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('button', { name: /^custom$/i }))
    await user.click(screen.getByRole('button', { name: /^dark$/i }))
    const s = document.documentElement.style
    expect(s.getPropertyValue('--primary')).toBe('')
    expect(s.getPropertyValue('--background')).toBe('')
    expect(s.getPropertyValue('--primary-hover')).toBe('')
    expect(s.getPropertyValue('--muted-hover')).toBe('')
  })

  test('changing button hover color sets --primary-hover', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('button', { name: /^custom$/i }))
    fireEvent.change(screen.getAllByDisplayValue(/^#/)[1], { target: { value: '#ff1234' } })
    expect(document.documentElement.style.getPropertyValue('--primary-hover')).toBe('#ff1234')
  })

  test('changing muted hover color sets --muted-hover', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('button', { name: /^custom$/i }))
    fireEvent.change(screen.getAllByDisplayValue(/^#/)[2], { target: { value: '#aabbcc' } })
    expect(document.documentElement.style.getPropertyValue('--muted-hover')).toBe('#aabbcc')
  })
})

describe('AppearanceSettings — font selection', () => {
  test('renders all font buttons', () => {
    render(<AppearanceSettings />)
    ;['Oxanium', 'Pacifico', 'Lobster', 'Dancing', 'Righteous', 'Abril', 'Satisfy', 'Playfair', 'Mono']
      .forEach(name => expect(screen.getByRole('button', { name })).toBeInTheDocument())
  })

  test('selecting a font sets document fontFamily', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('button', { name: 'Pacifico' }))
    expect(document.documentElement.style.fontFamily).toContain('Pacifico')
  })

  test('font is preserved when switching appearance modes', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('button', { name: 'Pacifico' }))
    await user.click(screen.getByRole('button', { name: /^light$/i }))
    expect(document.documentElement.style.fontFamily).toContain('Pacifico')
    await user.click(screen.getByRole('button', { name: /^dark$/i }))
    expect(document.documentElement.style.fontFamily).toContain('Pacifico')
  })

  test('selecting a font does not activate Custom mode', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('button', { name: 'Pacifico' }))
    expect(screen.getByRole('button', { name: /^dark$/i })).toHaveAttribute('data-active', 'true')
  })
})
