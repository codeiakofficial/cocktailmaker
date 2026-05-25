import type { DisplayMode, PresetMode, HeaderStyle, PresetColors, CustomColors } from './appearance-presets'
import { PRESETS, presetToCustom } from './appearance-presets'

export const DISPLAY_MODE_KEY      = 'vite-ui-display-mode'
export const HEADER_STYLE_KEY      = 'vite-ui-header-style'
export const CUSTOM_COLORS_KEY     = 'vite-ui-custom-colors'
export const FONT_KEY              = 'vite-ui-font'
export const BG_URL_KEY            = 'vite-ui-bg-url'
export const BORDER_OPACITY_KEY    = 'vite-ui-border-opacity'
export const BORDER_WIDTH_KEY      = 'vite-ui-border-width'
export const BORDER_LINE_STYLE_KEY = 'vite-ui-border-line-style'
export const FROST_KEY             = 'vite-ui-frost'
export const ANIMATIONS_KEY        = 'vite-ui-animations'

export function loadDisplayMode(): DisplayMode {
  const s = localStorage.getItem(DISPLAY_MODE_KEY)
  return (s === 'tropical' || s === 'lounge' || s === 'haze' || s === 'custom') ? s : 'lounge'
}

export function loadCustomColors(): CustomColors {
  const d = presetToCustom(PRESETS.lounge.colors)
  try {
    const r = JSON.parse(localStorage.getItem(CUSTOM_COLORS_KEY) ?? 'null')
    if (!r) return d
    // Migrate old field names (button→primary, hover→primaryHover, bg→background, etc.)
    return {
      primary:         r.primary        ?? r.button          ?? d.primary,
      secondary:       r.secondary      ?? r.secondaryButton ?? d.secondary,
      background:      r.background     ?? r.bg              ?? d.background,
      foreground:      r.foreground     ?? r.font            ?? d.foreground,
      mutedForeground: r.mutedForeground ?? r.muted          ?? d.mutedForeground,
      titleColor:      r.titleColor     ?? r.title           ?? d.titleColor,
      border:          r.border         ?? d.border,
    }
  } catch { return d }
}

export function loadFont(): string {
  return localStorage.getItem(FONT_KEY) ?? "'Oxanium Variable', sans-serif"
}

export function loadHeaderStyle(): HeaderStyle {
  return localStorage.getItem(HEADER_STYLE_KEY) === 'blur' ? 'blur' : 'solid'
}

export const set   = (p: string, v: string) => document.documentElement.style.setProperty(p, v)
export const unset = (p: string)            => document.documentElement.style.removeProperty(p)

// Properties set by both applyPresetColors and applyCustomColors.
// The app-config :root block in index.css must never define defaults for these —
// they are always overridden by JS and any CSS default would be dead code.
export const ALWAYS_SET_PROPS = [
  '--background', '--card', '--popover',
  '--foreground', '--card-foreground', '--popover-foreground',
  '--primary', '--primary-foreground',
  '--secondary', '--secondary-foreground',
  '--muted-foreground',
  '--border', '--input',
  '--title-color',
] as const

export const CUSTOM_PROPS = [
  '--primary', '--primary-foreground',
  '--secondary', '--secondary-foreground',
  '--background', '--card', '--popover',
  '--foreground', '--card-foreground', '--popover-foreground',
  '--muted-foreground',
  '--title-color', '--border', '--input',
]

export const COLORS: { key: keyof CustomColors; label: string; apply: (v: string) => void }[] = [
  { key: 'primary',         label: 'Primary button',   apply: v => set('--primary', v) },
  { key: 'secondary',       label: 'Secondary button', apply: v => { set('--secondary', v); set('--secondary-foreground', '#ffffff') } },
  { key: 'background',      label: 'Background',       apply: v => { set('--background', v); set('--card', v); set('--popover', v) } },
  { key: 'foreground',      label: 'Font color',       apply: v => { set('--foreground', v); set('--card-foreground', v); set('--popover-foreground', v) } },
  { key: 'mutedForeground', label: 'Muted text',       apply: v => set('--muted-foreground', v) },
  { key: 'titleColor',      label: 'Title color',      apply: v => set('--title-color', v) },
  { key: 'border',          label: 'Border color',     apply: v => { set('--border', v); set('--input', v) } },
]

export function applyPresetColors(p: PresetColors) {
  set('--background', p.background)
  set('--card', p.background)
  set('--popover', p.background)
  set('--foreground', p.foreground)
  set('--card-foreground', p.foreground)
  set('--popover-foreground', p.foreground)
  set('--primary', p.primary)
  set('--primary-foreground', '#ffffff')
  set('--secondary', p.secondary)
  set('--secondary-foreground', '#ffffff')
  set('--muted-foreground', p.mutedFg)
  set('--border', p.border)
  set('--input', p.border)
  set('--title-color', p.titleColor)
}

export function applyCustomColors(c: CustomColors) {
  set('--primary', c.primary)
  set('--primary-foreground', '#ffffff')
  set('--secondary', c.secondary)
  set('--secondary-foreground', '#ffffff')
  set('--background', c.background)
  set('--card', c.background)
  set('--popover', c.background)
  set('--foreground', c.foreground)
  set('--card-foreground', c.foreground)
  set('--popover-foreground', c.foreground)
  set('--muted-foreground', c.mutedForeground)
  set('--title-color', c.titleColor)
  set('--border', c.border)
  set('--input', c.border)
}

export function applyHeaderStyle(s: HeaderStyle) {
  s === 'blur'
    ? set('--header-bg', 'color-mix(in oklab, var(--background) 10%, transparent)')
    : unset('--header-bg')
}

export function restoreAppearance() {
  const mode   = loadDisplayMode()
  const preset = PRESETS[mode as PresetMode]
  if (preset) applyPresetColors(preset.colors)
  else        applyCustomColors(loadCustomColors())

  const font = localStorage.getItem(FONT_KEY)
  if (font) document.documentElement.style.fontFamily = font

  const bg = localStorage.getItem(BG_URL_KEY)
  if (bg) set('--bg-image-url', `url("${bg}")`)
  else    unset('--bg-image-url')

  const bo = localStorage.getItem(BORDER_OPACITY_KEY)
  if (bo) set('--border-opacity', bo)

  const bw = localStorage.getItem(BORDER_WIDTH_KEY)
  if (bw) set('--border-width', `${bw}px`)

  const bs = localStorage.getItem(BORDER_LINE_STYLE_KEY)
  if (bs) set('--border-style', bs)

  if (localStorage.getItem(FROST_KEY)      === 'true') document.documentElement.classList.add('frost')
  if (localStorage.getItem(ANIMATIONS_KEY) === 'true') document.documentElement.classList.add('animations')
}
