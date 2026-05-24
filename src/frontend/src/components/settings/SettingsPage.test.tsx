import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import SettingsPage from './SettingsPage'

vi.mock('../theme-provider', () => ({
  useTheme: () => ({ theme: 'dark', setTheme: vi.fn() }),
}))

beforeEach(() => {
  vi.stubGlobal('localStorage', { getItem: vi.fn().mockReturnValue(null), setItem: vi.fn() })
  document.documentElement.style.cssText = ''
})

describe('SettingsPage', () => {
  test('renders appearance settings content', () => {
    render(<SettingsPage />)
    expect(screen.getByRole('button', { name: /^dark$/i })).toBeInTheDocument()
    expect(screen.getByText('Colors')).toBeInTheDocument()
    expect(screen.getByText('Font')).toBeInTheDocument()
  })
})
