import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import AppearanceSettings, { restoreAppearance } from './AppearanceSettings'

const mockSetTheme = vi.fn()
const mockUseTheme = vi.fn()
vi.mock('../theme-provider', () => ({
  useTheme: () => mockUseTheme(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockUseTheme.mockReturnValue({ theme: 'dark', setTheme: mockSetTheme })
  vi.stubGlobal('localStorage', {
    getItem: vi.fn().mockReturnValue(null),
    setItem: vi.fn(),
  })
  document.documentElement.style.cssText = ''
  document.documentElement.style.fontFamily = ''
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

  test('initialises colors from stored localStorage values', () => {
    localStorage.getItem = vi.fn((key: string) => {
      if (key === 'vite-ui-custom-colors') return JSON.stringify({ button: '#111111', hover: '#222222', bg: '#333333', font: '#444444', muted: '#555555', title: '#666666', border: '#777777', mutedHover: '#888888' })
      return null
    })
    render(<AppearanceSettings />)
    expect(screen.getByDisplayValue('#111111')).toBeInTheDocument()
    expect(screen.getByDisplayValue('#222222')).toBeInTheDocument()
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

  test('selecting a font saves it to localStorage', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('button', { name: 'Pacifico' }))
    expect(localStorage.setItem).toHaveBeenCalledWith('vite-ui-font', expect.stringContaining('Pacifico'))
  })

  test('initialises font from localStorage', () => {
    localStorage.getItem = vi.fn((key: string) => key === 'vite-ui-font' ? "'Pacifico', cursive" : null)
    render(<AppearanceSettings />)
    expect(screen.getByRole('button', { name: 'Pacifico' })).toHaveClass('border-primary')
  })
})

describe('AppearanceSettings — initial mode', () => {
  test('dark button is active by default', () => {
    render(<AppearanceSettings />)
    expect(screen.getByRole('button', { name: /^dark$/i })).toHaveAttribute('data-active', 'true')
    expect(screen.getByRole('button', { name: /^light$/i })).toHaveAttribute('data-active', 'false')
    expect(screen.getByRole('button', { name: /^custom$/i })).toHaveAttribute('data-active', 'false')
  })

  test('light button is active when localStorage has "light"', () => {
    localStorage.getItem = vi.fn((key: string) => key === 'vite-ui-display-mode' ? 'light' : null)
    render(<AppearanceSettings />)
    expect(screen.getByRole('button', { name: /^light$/i })).toHaveAttribute('data-active', 'true')
    expect(screen.getByRole('button', { name: /^dark$/i })).toHaveAttribute('data-active', 'false')
  })

  test('custom button is active when localStorage has "custom"', () => {
    localStorage.getItem = vi.fn((key: string) => key === 'vite-ui-display-mode' ? 'custom' : null)
    render(<AppearanceSettings />)
    expect(screen.getByRole('button', { name: /^custom$/i })).toHaveAttribute('data-active', 'true')
    expect(screen.getByRole('button', { name: /^dark$/i })).toHaveAttribute('data-active', 'false')
  })

  test('switching to custom persists "custom" to localStorage', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('button', { name: /^custom$/i }))
    expect(localStorage.setItem).toHaveBeenCalledWith('vite-ui-display-mode', 'custom')
  })

  test('switching to dark persists "dark" to localStorage', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('button', { name: /^custom$/i }))
    await user.click(screen.getByRole('button', { name: /^dark$/i }))
    expect(localStorage.setItem).toHaveBeenCalledWith('vite-ui-display-mode', 'dark')
  })

  test('changing a color picker while in dark mode saves "custom" display mode', () => {
    render(<AppearanceSettings />)
    fireEvent.change(screen.getAllByDisplayValue(/^#/)[0], { target: { value: '#abcdef' } })
    expect(localStorage.setItem).toHaveBeenCalledWith('vite-ui-display-mode', 'custom')
  })
})

describe('AppearanceSettings — color persistence', () => {
  test('saves custom colors to localStorage when a color picker changes', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('button', { name: /^custom$/i }))
    fireEvent.change(screen.getAllByDisplayValue(/^#/)[0], { target: { value: '#abcdef' } })
    expect(localStorage.setItem).toHaveBeenCalledWith('vite-ui-custom-colors', expect.stringContaining('#abcdef'))
  })
})

describe('AppearanceSettings — restoreAppearance', () => {
  test('applies stored custom CSS vars when mode is "custom"', () => {
    localStorage.getItem = vi.fn((key: string) => {
      if (key === 'vite-ui-display-mode') return 'custom'
      if (key === 'vite-ui-custom-colors') return JSON.stringify({ button: '#ff0000', hover: '#ee0000', bg: '#001122', font: '#ffffff', muted: '#aaaaaa', title: '#cccccc', border: '#444444', mutedHover: '#555555' })
      return null
    })
    restoreAppearance()
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('#ff0000')
    expect(document.documentElement.style.getPropertyValue('--background')).toBe('#001122')
    expect(document.documentElement.style.getPropertyValue('--primary-hover')).toBe('#ee0000')
  })

  test('applies tropical palette when mode is "light"', () => {
    localStorage.getItem = vi.fn((key: string) => key === 'vite-ui-display-mode' ? 'light' : null)
    restoreAppearance()
    expect(document.documentElement.style.getPropertyValue('--background')).toBe('#fef9ec')
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('#e67e22')
  })

  test('does not set custom CSS vars when mode is "dark"', () => {
    localStorage.getItem = vi.fn().mockReturnValue(null)
    restoreAppearance()
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('')
    expect(document.documentElement.style.getPropertyValue('--background')).toBe('')
  })

  test('applies stored font regardless of mode', () => {
    localStorage.getItem = vi.fn((key: string) => key === 'vite-ui-font' ? "'Pacifico', cursive" : null)
    restoreAppearance()
    expect(document.documentElement.style.fontFamily).toContain('Pacifico')
  })
})

describe('AppearanceSettings — background image', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    }))
  })

  test('renders an image URL input via ImageSelector', () => {
    render(<AppearanceSettings />)
    expect(screen.getByPlaceholderText(/image url/i)).toBeInTheDocument()
  })

  test('renders an Upload button', () => {
    render(<AppearanceSettings />)
    expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument()
  })

  test('typing a URL and pressing Enter saves it to localStorage', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    const input = screen.getByPlaceholderText(/image url/i)
    await user.clear(input)
    await user.type(input, 'https://example.com/bg.jpg')
    await user.keyboard('{Enter}')
    expect(localStorage.setItem).toHaveBeenCalledWith('vite-ui-bg-url', 'https://example.com/bg.jpg')
  })

  test('typing a URL and pressing Enter applies it as CSS var', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    const input = screen.getByPlaceholderText(/image url/i)
    await user.clear(input)
    await user.type(input, 'https://example.com/bg.jpg')
    await user.keyboard('{Enter}')
    expect(document.documentElement.style.getPropertyValue('--bg-image-url')).toContain('https://example.com/bg.jpg')
  })

  test('restoreAppearance applies stored background URL as CSS var', () => {
    localStorage.getItem = vi.fn((key: string) =>
      key === 'vite-ui-bg-url' ? 'https://example.com/bg.jpg' : null
    )
    restoreAppearance()
    expect(document.documentElement.style.getPropertyValue('--bg-image-url')).toContain('https://example.com/bg.jpg')
  })
})

describe('AppearanceSettings — header style toggle', () => {
  test('renders Solid and Blur header buttons', () => {
    render(<AppearanceSettings />)
    expect(screen.getByRole('button', { name: /^solid$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^blur$/i })).toBeInTheDocument()
  })

  test('Solid is active by default', () => {
    render(<AppearanceSettings />)
    expect(screen.getByRole('button', { name: /^solid$/i })).toHaveAttribute('data-active', 'true')
    expect(screen.getByRole('button', { name: /^blur$/i })).toHaveAttribute('data-active', 'false')
  })

  test('Blur is active when localStorage has "blur"', () => {
    localStorage.getItem = vi.fn((key: string) => key === 'vite-ui-header-style' ? 'blur' : null)
    render(<AppearanceSettings />)
    expect(screen.getByRole('button', { name: /^blur$/i })).toHaveAttribute('data-active', 'true')
    expect(screen.getByRole('button', { name: /^solid$/i })).toHaveAttribute('data-active', 'false')
  })

  test('clicking Blur sets --header-bg to a low-opacity value', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('button', { name: /^blur$/i }))
    expect(document.documentElement.style.getPropertyValue('--header-bg')).not.toBe('')
  })

  test('clicking Solid clears the --header-bg override', async () => {
    const user = userEvent.setup()
    localStorage.getItem = vi.fn((key: string) => key === 'vite-ui-header-style' ? 'blur' : null)
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('button', { name: /^solid$/i }))
    expect(document.documentElement.style.getPropertyValue('--header-bg')).toBe('')
  })

  test('clicking Blur persists "blur" to localStorage', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('button', { name: /^blur$/i }))
    expect(localStorage.setItem).toHaveBeenCalledWith('vite-ui-header-style', 'blur')
  })

  test('clicking Solid persists "solid" to localStorage', async () => {
    const user = userEvent.setup()
    localStorage.getItem = vi.fn((key: string) => key === 'vite-ui-header-style' ? 'blur' : null)
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('button', { name: /^solid$/i }))
    expect(localStorage.setItem).toHaveBeenCalledWith('vite-ui-header-style', 'solid')
  })
})

describe('AppearanceSettings — border controls', () => {
  test('renders a Border section with style preset buttons', () => {
    render(<AppearanceSettings />)
    expect(screen.getByText('Border')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^none$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^subtle$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^normal$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^bold$/i })).toBeInTheDocument()
  })

  test('renders a border opacity slider', () => {
    render(<AppearanceSettings />)
    const slider = screen.getByRole('slider', { name: /border opacity/i })
    expect(slider).toBeInTheDocument()
  })

  test('Normal is active by default', () => {
    render(<AppearanceSettings />)
    expect(screen.getByRole('button', { name: /^normal$/i })).toHaveAttribute('data-active', 'true')
  })

  test('clicking None sets --border-opacity to 0', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('button', { name: /^none$/i }))
    expect(document.documentElement.style.getPropertyValue('--border-opacity')).toBe('0')
  })

  test('clicking Subtle sets --border-opacity to 0.3', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('button', { name: /^subtle$/i }))
    expect(document.documentElement.style.getPropertyValue('--border-opacity')).toBe('0.3')
  })

  test('clicking Normal sets --border-opacity to 1', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('button', { name: /^none$/i }))
    await user.click(screen.getByRole('button', { name: /^normal$/i }))
    expect(document.documentElement.style.getPropertyValue('--border-opacity')).toBe('1')
  })

  test('clicking Bold sets --border-opacity to 1', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('button', { name: /^bold$/i }))
    expect(document.documentElement.style.getPropertyValue('--border-opacity')).toBe('1')
  })

  test('border style preset persists to localStorage', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('button', { name: /^subtle$/i }))
    expect(localStorage.setItem).toHaveBeenCalledWith('vite-ui-border-style', 'subtle')
  })

  test('border opacity slider change sets --border-opacity', async () => {
    render(<AppearanceSettings />)
    const slider = screen.getByRole('slider', { name: /border opacity/i })
    fireEvent.change(slider, { target: { value: '0.5' } })
    expect(document.documentElement.style.getPropertyValue('--border-opacity')).toBe('0.5')
  })

  test('border opacity persists to localStorage', () => {
    render(<AppearanceSettings />)
    const slider = screen.getByRole('slider', { name: /border opacity/i })
    fireEvent.change(slider, { target: { value: '0.6' } })
    expect(localStorage.setItem).toHaveBeenCalledWith('vite-ui-border-opacity', '0.6')
  })

  test('initialises style from localStorage', () => {
    localStorage.getItem = vi.fn((key: string) => key === 'vite-ui-border-style' ? 'subtle' : null)
    render(<AppearanceSettings />)
    expect(screen.getByRole('button', { name: /^subtle$/i })).toHaveAttribute('data-active', 'true')
    expect(screen.getByRole('button', { name: /^normal$/i })).toHaveAttribute('data-active', 'false')
  })

  test('initialises slider value from localStorage', () => {
    localStorage.getItem = vi.fn((key: string) => key === 'vite-ui-border-opacity' ? '0.4' : null)
    render(<AppearanceSettings />)
    const slider = screen.getByRole('slider', { name: /border opacity/i })
    expect((slider as HTMLInputElement).value).toBe('0.4')
  })

  test('restoreAppearance applies stored border opacity', () => {
    localStorage.getItem = vi.fn((key: string) => key === 'vite-ui-border-opacity' ? '0.5' : null)
    restoreAppearance()
    expect(document.documentElement.style.getPropertyValue('--border-opacity')).toBe('0.5')
  })
})

describe('AppearanceSettings — vignette', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('vignette')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([]) }))
  })

  test('renders a Vignette toggle switch', () => {
    render(<AppearanceSettings />)
    expect(screen.getByRole('switch', { name: /vignette/i })).toBeInTheDocument()
  })

  test('toggle is unchecked by default', () => {
    render(<AppearanceSettings />)
    expect(screen.getByRole('switch', { name: /vignette/i })).toHaveAttribute('aria-checked', 'false')
  })

  test('clicking Vignette switch adds vignette class to html', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('switch', { name: /vignette/i }))
    expect(document.documentElement.classList.contains('vignette')).toBe(true)
  })

  test('clicking again removes vignette class', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('switch', { name: /vignette/i }))
    await user.click(screen.getByRole('switch', { name: /vignette/i }))
    expect(document.documentElement.classList.contains('vignette')).toBe(false)
  })

  test('vignette state persists to localStorage', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('switch', { name: /vignette/i }))
    expect(localStorage.setItem).toHaveBeenCalledWith('vite-ui-vignette', 'true')
  })

  test('restoreAppearance applies vignette class when stored', () => {
    localStorage.getItem = vi.fn((key: string) => key === 'vite-ui-vignette' ? 'true' : null)
    restoreAppearance()
    expect(document.documentElement.classList.contains('vignette')).toBe(true)
  })

  test('switch aria-checked is true when vignette is on', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('switch', { name: /vignette/i }))
    expect(screen.getByRole('switch', { name: /vignette/i })).toHaveAttribute('aria-checked', 'true')
  })

  test('initialises as checked from localStorage', () => {
    localStorage.getItem = vi.fn((key: string) => key === 'vite-ui-vignette' ? 'true' : null)
    render(<AppearanceSettings />)
    expect(screen.getByRole('switch', { name: /vignette/i })).toHaveAttribute('aria-checked', 'true')
  })
})

describe('AppearanceSettings — animations', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('animations')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([]) }))
  })

  test('renders an Animations toggle switch', () => {
    render(<AppearanceSettings />)
    expect(screen.getByRole('switch', { name: /animations/i })).toBeInTheDocument()
  })

  test('clicking adds animations class to html', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('switch', { name: /animations/i }))
    expect(document.documentElement.classList.contains('animations')).toBe(true)
  })

  test('clicking again removes animations class', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('switch', { name: /animations/i }))
    await user.click(screen.getByRole('switch', { name: /animations/i }))
    expect(document.documentElement.classList.contains('animations')).toBe(false)
  })

  test('animations state persists to localStorage', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)
    await user.click(screen.getByRole('switch', { name: /animations/i }))
    expect(localStorage.setItem).toHaveBeenCalledWith('vite-ui-animations', 'true')
  })

  test('restoreAppearance applies animations class when stored', () => {
    localStorage.getItem = vi.fn((key: string) => key === 'vite-ui-animations' ? 'true' : null)
    restoreAppearance()
    expect(document.documentElement.classList.contains('animations')).toBe(true)
  })
})
