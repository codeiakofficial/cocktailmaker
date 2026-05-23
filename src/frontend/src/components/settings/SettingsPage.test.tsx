import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import SettingsPage from './SettingsPage'
import { COLOR_THEMES } from '../../contexts/ColorTheme'

vi.mock('../../contexts/ColorTheme', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../contexts/ColorTheme')>()
  return { ...actual, applyColorTheme: vi.fn(), saveColorTheme: vi.fn() }
})

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
})

describe('SettingsPage — appearance', () => {
  test('renders a button for each color theme', () => {
    render(<SettingsPage />)
    COLOR_THEMES.forEach(t => {
      expect(screen.getByRole('button', { name: t.name })).toBeInTheDocument()
    })
  })

  test('renders light, dark and system mode options', () => {
    render(<SettingsPage />)
    expect(screen.getByRole('button', { name: /light/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dark/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /system/i })).toBeInTheDocument()
  })
})

describe('SettingsPage — color theme selection', () => {
  test('clicking a theme applies and saves it', async () => {
    const { applyColorTheme, saveColorTheme } = await import('../../contexts/ColorTheme')
    const user = userEvent.setup()
    render(<SettingsPage />)

    await user.click(screen.getByRole('button', { name: COLOR_THEMES[1].name }))

    expect(applyColorTheme).toHaveBeenCalledWith(COLOR_THEMES[1])
    expect(saveColorTheme).toHaveBeenCalledWith(COLOR_THEMES[1])
  })
})

describe('SettingsPage — mode selection', () => {
  test('clicking Dark calls setTheme with "dark"', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)
    await user.click(screen.getByRole('button', { name: /dark/i }))
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  test('clicking Light calls setTheme with "light"', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)
    await user.click(screen.getByRole('button', { name: /light/i }))
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  test('clicking System calls setTheme with "system"', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)
    await user.click(screen.getByRole('button', { name: /system/i }))
    expect(mockSetTheme).toHaveBeenCalledWith('system')
  })
})
