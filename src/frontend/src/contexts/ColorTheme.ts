export const COLOR_THEME_STORAGE_KEY = 'vite-ui-color-theme'

export interface ColorTheme {
  id: string
  name: string
  light: { primary: string; primaryFg: string }
  dark: { primary: string; primaryFg: string }
}

export const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'rose',
    name: 'Rose',
    light: { primary: 'oklch(0.525 0.223 3.958)', primaryFg: 'oklch(0.971 0.014 343.198)' },
    dark:  { primary: 'oklch(0.459 0.187 3.815)', primaryFg: 'oklch(0.971 0.014 343.198)' },
  },
  {
    id: 'blue',
    name: 'Blue',
    light: { primary: 'oklch(0.488 0.204 252.0)', primaryFg: 'oklch(0.971 0.014 252.0)' },
    dark:  { primary: 'oklch(0.55 0.2 252.0)',   primaryFg: 'oklch(0.971 0.014 252.0)' },
  },
  {
    id: 'green',
    name: 'Green',
    light: { primary: 'oklch(0.48 0.18 145.0)',  primaryFg: 'oklch(0.97 0.05 145.0)' },
    dark:  { primary: 'oklch(0.52 0.18 145.0)',  primaryFg: 'oklch(0.97 0.05 145.0)' },
  },
  {
    id: 'orange',
    name: 'Orange',
    light: { primary: 'oklch(0.6 0.2 50.0)',     primaryFg: 'oklch(0.97 0.05 50.0)' },
    dark:  { primary: 'oklch(0.55 0.2 50.0)',    primaryFg: 'oklch(0.97 0.05 50.0)' },
  },
  {
    id: 'purple',
    name: 'Purple',
    light: { primary: 'oklch(0.5 0.22 290.0)',   primaryFg: 'oklch(0.97 0.05 290.0)' },
    dark:  { primary: 'oklch(0.55 0.22 290.0)',  primaryFg: 'oklch(0.97 0.05 290.0)' },
  },
]

export function applyColorTheme(theme: ColorTheme): void {
  const root = document.documentElement
  root.style.setProperty('--primary', theme.light.primary)
  root.style.setProperty('--primary-foreground', theme.light.primaryFg)
  root.setAttribute('data-primary-dark', theme.dark.primary)
  root.setAttribute('data-primaryfg-dark', theme.dark.primaryFg)

  // Inject a <style> override so dark mode also picks up the new primary
  const styleId = 'color-theme-override'
  let el = document.getElementById(styleId) as HTMLStyleElement | null
  if (!el) {
    el = document.createElement('style')
    el.id = styleId
    document.head.appendChild(el)
  }
  el.textContent = `.dark { --primary: ${theme.dark.primary}; --primary-foreground: ${theme.dark.primaryFg}; }`
}

export function saveColorTheme(theme: ColorTheme): void {
  localStorage.setItem(COLOR_THEME_STORAGE_KEY, theme.id)
}

export function loadColorTheme(): ColorTheme {
  const id = localStorage.getItem(COLOR_THEME_STORAGE_KEY)
  return COLOR_THEMES.find(t => t.id === id) ?? COLOR_THEMES[0]
}
