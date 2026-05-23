import { describe, test, expect, beforeEach, vi } from 'vitest'
import { COLOR_THEMES, applyColorTheme, loadColorTheme, saveColorTheme, COLOR_THEME_STORAGE_KEY } from './ColorTheme'

beforeEach(() => {
  vi.stubGlobal('localStorage', {
    getItem: vi.fn().mockReturnValue(null),
    setItem: vi.fn(),
  })
  document.documentElement.style.cssText = ''
})

describe('COLOR_THEMES', () => {
  test('contains at least 4 named themes', () => {
    expect(COLOR_THEMES.length).toBeGreaterThanOrEqual(4)
  })

  test('each theme has an id, name, and light/dark primary values', () => {
    COLOR_THEMES.forEach(t => {
      expect(t.id).toBeTruthy()
      expect(t.name).toBeTruthy()
      expect(t.light.primary).toBeTruthy()
      expect(t.light.primaryFg).toBeTruthy()
      expect(t.dark.primary).toBeTruthy()
      expect(t.dark.primaryFg).toBeTruthy()
    })
  })

  test('ids are unique', () => {
    const ids = COLOR_THEMES.map(t => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('applyColorTheme', () => {
  test('sets --primary and --primary-foreground on :root', () => {
    const theme = COLOR_THEMES[0]
    applyColorTheme(theme)
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe(theme.light.primary)
    expect(document.documentElement.style.getPropertyValue('--primary-foreground')).toBe(theme.light.primaryFg)
  })

  test('sets dark-mode overrides as a data attribute for CSS targeting', () => {
    const theme = COLOR_THEMES[0]
    applyColorTheme(theme)
    expect(document.documentElement.getAttribute('data-primary-dark')).toBe(theme.dark.primary)
    expect(document.documentElement.getAttribute('data-primaryfg-dark')).toBe(theme.dark.primaryFg)
  })
})

describe('persistence', () => {
  test('saveColorTheme writes theme id to localStorage', () => {
    const theme = COLOR_THEMES[1]
    saveColorTheme(theme)
    expect(localStorage.setItem).toHaveBeenCalledWith(COLOR_THEME_STORAGE_KEY, theme.id)
  })

  test('loadColorTheme returns theme matching stored id', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(COLOR_THEMES[2].id)
    expect(loadColorTheme()).toEqual(COLOR_THEMES[2])
  })

  test('loadColorTheme returns first theme when nothing is stored', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null)
    expect(loadColorTheme()).toEqual(COLOR_THEMES[0])
  })

  test('loadColorTheme returns first theme when stored id is unknown', () => {
    vi.mocked(localStorage.getItem).mockReturnValue('unknown-id')
    expect(loadColorTheme()).toEqual(COLOR_THEMES[0])
  })
})
