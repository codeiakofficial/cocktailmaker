import * as React from 'react'
import { useTheme } from '../theme-provider'
import { Button } from '../ui/button'
import { ImageSelector } from '../ui/ImageSelector'

type DisplayMode = 'tropical' | 'lounge' | 'custom'
type HeaderStyle = 'solid' | 'blur'

const FONTS = [
  { label: 'Oxanium',  family: "'Oxanium Variable', sans-serif" },
  { label: 'Pacifico', family: "'Pacifico', cursive" },
  { label: 'Lobster',  family: "'Lobster', cursive" },
  { label: 'Dancing',  family: "'Dancing Script', cursive" },
  { label: 'Righteous',family: "'Righteous', sans-serif" },
  { label: 'Abril',    family: "'Abril Fatface', serif" },
  { label: 'Satisfy',  family: "'Satisfy', cursive" },
  { label: 'Playfair', family: "'Playfair Display Variable', serif" },
  { label: 'Mono',     family: 'ui-monospace, monospace' },
]

// ─── Preset fine-tuning ───────────────────────────────────────────────────────
// Edit TROPICAL_LIGHT to tune the Tropical preset colors.
// For Lounge, edit the `.dark { ... }` block in src/frontend/src/index.css.
const TROPICAL_BG   = '/defaults/tropical.jpg'
const LOUNGE_BG     = '/defaults/lounge.jpg'

const TROPICAL_LIGHT = {
  background: '#fef9ec', card: '#fef9ec', popover: '#fef9ec',
  foreground: '#2c1a0e', cardForeground: '#2c1a0e',
  primary: '#e67e22', primaryFg: '#ffffff',
  secondary: '#d4a853', secondaryFg: '#2c1a0e',
  muted: '#f5e6c8', mutedFg: '#92400e',
  border: '#d4a853', input: '#d4a853', titleColor: '#c0392b',
}
// ─────────────────────────────────────────────────────────────────────────────

const CUSTOM_PROPS = [
  '--primary', '--primary-foreground',
  '--secondary', '--secondary-foreground',
  '--background', '--card', '--popover',
  '--foreground', '--card-foreground', '--popover-foreground',
  '--muted', '--muted-foreground',
  '--title-color', '--border', '--input', '--primary-hover', '--muted-hover',
]

const DISPLAY_MODE_KEY    = 'vite-ui-display-mode'
const HEADER_STYLE_KEY    = 'vite-ui-header-style'
const CUSTOM_COLORS_KEY   = 'vite-ui-custom-colors'
const FONT_KEY            = 'vite-ui-font'
const BG_URL_KEY          = 'vite-ui-bg-url'
const BORDER_OPACITY_KEY    = 'vite-ui-border-opacity'
const BORDER_WIDTH_KEY      = 'vite-ui-border-width'
const BORDER_LINE_STYLE_KEY = 'vite-ui-border-line-style'
const VIGNETTE_KEY          = 'vite-ui-vignette'
const ANIMATIONS_KEY        = 'vite-ui-animations'

type BorderLineStyle = 'solid' | 'dashed' | 'dotted'

interface CustomColors {
  button: string; hover: string; secondaryButton: string; bg: string; font: string
  muted: string; title: string; border: string; mutedHover: string
}

const DEFAULT_COLORS: CustomColors = {
  button: '#d4274a', hover: '#a01e38', secondaryButton: '#2d3748', bg: '#1a1a2e',
  font: '#f5f5f5', muted: '#9a9ab0', title: '#ffffff',
  border: '#2e2e3a', mutedHover: '#2e2e4a',
}

function loadDisplayMode(): DisplayMode {
  const stored = localStorage.getItem(DISPLAY_MODE_KEY)
  if (stored === 'tropical' || stored === 'lounge' || stored === 'custom') return stored
  if (stored === 'light') return 'tropical'   // backwards compat
  return 'lounge'
}

function saveDisplayMode(mode: DisplayMode) {
  localStorage.setItem(DISPLAY_MODE_KEY, mode)
}

function loadCustomColors(): CustomColors {
  try {
    const stored = localStorage.getItem(CUSTOM_COLORS_KEY)
    if (stored) return { ...DEFAULT_COLORS, ...JSON.parse(stored) }
  } catch {}
  return { ...DEFAULT_COLORS }
}

function saveCustomColors(c: CustomColors) {
  localStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(c))
}

function loadFont(): string {
  return localStorage.getItem(FONT_KEY) ?? FONTS[0].family
}

function saveFont(f: string) {
  localStorage.setItem(FONT_KEY, f)
}

function loadHeaderStyle(): HeaderStyle {
  return localStorage.getItem(HEADER_STYLE_KEY) === 'blur' ? 'blur' : 'solid'
}

const set   = (prop: string, val: string) => document.documentElement.style.setProperty(prop, val)
const unset = (prop: string) => document.documentElement.style.removeProperty(prop)

function clearCustomOverrides() { CUSTOM_PROPS.forEach(unset) }

function applyTropicalLight() {
  const p = TROPICAL_LIGHT
  set('--background', p.background); set('--card', p.card); set('--popover', p.popover)
  set('--foreground', p.foreground); set('--card-foreground', p.cardForeground)
  set('--popover-foreground', p.foreground)
  set('--primary', p.primary); set('--primary-foreground', p.primaryFg)
  set('--secondary', p.secondary); set('--secondary-foreground', p.secondaryFg)
  set('--muted', p.muted); set('--muted-foreground', p.mutedFg)
  set('--border', p.border); set('--input', p.input)
  set('--title-color', p.titleColor)
}

function applyBackgroundUrl(url: string | null) {
  if (url) {
    set('--bg-image-url', `url("${url}")`)
  } else {
    unset('--bg-image-url')
  }
}

export function applyHeaderStyle(style: HeaderStyle) {
  if (style === 'blur') {
    set('--header-bg', 'color-mix(in oklab, var(--background) 10%, transparent)')
  } else {
    unset('--header-bg')
  }
}

export function restoreAppearance() {
  const mode = localStorage.getItem(DISPLAY_MODE_KEY)
  if (mode === 'tropical' || mode === 'light') {
    applyTropicalLight()
  } else if (mode === 'custom') {
    const c = loadCustomColors()
    set('--background', c.bg);  set('--card', c.bg);  set('--popover', c.bg)
    set('--foreground', c.font); set('--card-foreground', c.font); set('--popover-foreground', c.font)
    set('--muted-foreground', c.muted)
    set('--primary', c.button); set('--primary-foreground', '#ffffff')
    set('--primary-hover', c.hover)
    set('--secondary', c.secondaryButton); set('--secondary-foreground', '#ffffff')
    set('--muted-hover', c.mutedHover)
    set('--title-color', c.title)
    set('--border', c.border); set('--input', c.border)
  }
  const font = localStorage.getItem(FONT_KEY)
  if (font) document.documentElement.style.fontFamily = font
  const bgUrl = localStorage.getItem(BG_URL_KEY)
  applyBackgroundUrl(bgUrl)
  const borderOpacity = localStorage.getItem(BORDER_OPACITY_KEY)
  if (borderOpacity !== null) set('--border-opacity', borderOpacity)
  const borderWidth = localStorage.getItem(BORDER_WIDTH_KEY)
  if (borderWidth !== null) set('--border-width', `${borderWidth}px`)
  const borderLineStyle = localStorage.getItem(BORDER_LINE_STYLE_KEY)
  if (borderLineStyle) set('--border-style', borderLineStyle)
  if (localStorage.getItem(VIGNETTE_KEY) === 'true') document.documentElement.classList.add('vignette')
  if (localStorage.getItem(ANIMATIONS_KEY) === 'true') document.documentElement.classList.add('animations')
}

interface ColorRowProps { label: string; hex: string; disabled: boolean; onChange: (v: string) => void }
function ColorRow({ label, hex, disabled, onChange }: ColorRowProps) {
  return (
    <label className={`flex items-center justify-between text-sm${disabled ? ' opacity-40 pointer-events-none' : ''}`}>
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-mono">{hex}</span>
        <input type="color" value={hex} disabled={disabled}
          onChange={e => onChange(e.target.value)}
          className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent p-0.5 disabled:cursor-not-allowed"
        />
      </div>
    </label>
  )
}

interface ToggleRowProps { label: string; checked: boolean; ariaLabel: string; onChange: () => void }
function ToggleRow({ label, checked, ariaLabel, onChange }: ToggleRowProps) {
  return (
    <label className="flex items-center justify-between text-sm cursor-pointer select-none">
      <span className="text-muted-foreground">{label}</span>
      <button
        role="switch"
        aria-label={ariaLabel}
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-primary' : 'bg-muted-foreground/20'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </label>
  )
}

export default function AppearanceSettings() {
  const { setTheme } = useTheme()
  const [displayMode,     setDisplayMode]     = React.useState<DisplayMode>(() => loadDisplayMode())
  const initColors = loadCustomColors()
  const [buttonColor,          setButtonColor]          = React.useState(initColors.button)
  const [hoverColor,           setHoverColor]           = React.useState(initColors.hover)
  const [secondaryButtonColor, setSecondaryButtonColor] = React.useState(initColors.secondaryButton)
  const [bgColor,              setBgColor]              = React.useState(initColors.bg)
  const [fontColor,       setFontColor]       = React.useState(initColors.font)
  const [mutedColor,      setMutedColor]      = React.useState(initColors.muted)
  const [titleColor,      setTitleColor]      = React.useState(initColors.title)
  const [borderColor,     setBorderColor]     = React.useState(initColors.border)
  const [mutedHoverColor, setMutedHoverColor] = React.useState(initColors.mutedHover)
  const [activeFont,      setActiveFont]      = React.useState(() => loadFont())
  const [headerStyle,     setHeaderStyle]     = React.useState<HeaderStyle>(() => loadHeaderStyle())
  const [backgroundUrl,   setBackgroundUrl]   = React.useState(() => localStorage.getItem(BG_URL_KEY) ?? '')
  const [borderLineStyle, setBorderLineStyle] = React.useState<BorderLineStyle>(() => (localStorage.getItem(BORDER_LINE_STYLE_KEY) as BorderLineStyle) ?? 'solid')
  const [borderOpacity,   setBorderOpacity]   = React.useState(() => parseFloat(localStorage.getItem(BORDER_OPACITY_KEY) ?? '1'))
  const [borderWidth,     setBorderWidth]     = React.useState(() => parseFloat(localStorage.getItem(BORDER_WIDTH_KEY) ?? '1'))
  const [vignette,        setVignette]        = React.useState(() => localStorage.getItem(VIGNETTE_KEY) === 'true')
  const [animations,      setAnimations]      = React.useState(() => localStorage.getItem(ANIMATIONS_KEY) === 'true')

  const isCustom = displayMode === 'custom'

  React.useEffect(() => {
    saveCustomColors({ button: buttonColor, hover: hoverColor, secondaryButton: secondaryButtonColor, bg: bgColor, font: fontColor, muted: mutedColor, title: titleColor, border: borderColor, mutedHover: mutedHoverColor })
  }, [buttonColor, hoverColor, secondaryButtonColor, bgColor, fontColor, mutedColor, titleColor, borderColor, mutedHoverColor])

  const enterCustom = () => {
    setDisplayMode('custom')
    saveDisplayMode('custom')
    setTheme('light')
  }

  const applyAllCustom = (btn: string, hover: string, secondary: string, bg: string, font: string, muted: string, title: string, border: string, mutedHover: string, fontFam: string) => {
    set('--background', bg);  set('--card', bg);  set('--popover', bg)
    set('--foreground', font); set('--card-foreground', font); set('--popover-foreground', font)
    set('--muted-foreground', muted)
    set('--primary', btn); set('--primary-foreground', '#ffffff')
    set('--primary-hover', hover)
    set('--secondary', secondary); set('--secondary-foreground', '#ffffff')
    set('--muted-hover', mutedHover)
    set('--title-color', title)
    set('--border', border); set('--input', border)
    document.documentElement.style.fontFamily = fontFam
  }

  const handleModeChange = (mode: DisplayMode) => {
    setDisplayMode(mode)
    saveDisplayMode(mode)
    if (mode === 'lounge') {
      setTheme('dark')
      clearCustomOverrides()
      setBackgroundUrl(LOUNGE_BG)
      localStorage.setItem(BG_URL_KEY, LOUNGE_BG)
      applyBackgroundUrl(LOUNGE_BG)
    } else if (mode === 'tropical') {
      setTheme('light')
      clearCustomOverrides()
      applyTropicalLight()
      setBackgroundUrl(TROPICAL_BG)
      localStorage.setItem(BG_URL_KEY, TROPICAL_BG)
      applyBackgroundUrl(TROPICAL_BG)
      setAnimations(true)
      localStorage.setItem(ANIMATIONS_KEY, 'true')
      document.documentElement.classList.add('animations')
      setVignette(true)
      localStorage.setItem(VIGNETTE_KEY, 'true')
      document.documentElement.classList.add('vignette')
    } else {
      enterCustom()
      applyAllCustom(buttonColor, hoverColor, secondaryButtonColor, bgColor, fontColor, mutedColor, titleColor, borderColor, mutedHoverColor, activeFont)
    }
  }

  const picker = (setter: (v: string) => void, apply: (v: string) => void) => (v: string) => {
    setter(v); if (!isCustom) enterCustom(); apply(v)
  }

  const handleButtonColor          = picker(setButtonColor,          v => set('--primary', v))
  const handleHoverColor           = picker(setHoverColor,           v => set('--primary-hover', v))
  const handleSecondaryButtonColor = picker(setSecondaryButtonColor, v => { set('--secondary', v); set('--secondary-foreground', '#ffffff') })
  const handleBgColor         = picker(setBgColor,         v => { set('--background', v); set('--card', v); set('--popover', v) })
  const handleFontColor       = picker(setFontColor,       v => { set('--foreground', v); set('--card-foreground', v); set('--popover-foreground', v) })
  const handleMutedColor      = picker(setMutedColor,      v => set('--muted-foreground', v))
  const handleTitleColor      = picker(setTitleColor,      v => set('--title-color', v))
  const handleBorderColor     = picker(setBorderColor,     v => { set('--border', v); set('--input', v) })
  const handleMutedHoverColor = picker(setMutedHoverColor, v => set('--muted-hover', v))
  const handleFont            = (v: string) => { setActiveFont(v); document.documentElement.style.fontFamily = v; saveFont(v) }
  const handleHeaderStyle     = (s: HeaderStyle) => { setHeaderStyle(s); applyHeaderStyle(s); localStorage.setItem(HEADER_STYLE_KEY, s) }

  const commitBgUrl = (url: string) => {
    setBackgroundUrl(url)
    localStorage.setItem(BG_URL_KEY, url)
    applyBackgroundUrl(url || null)
  }

  const handleBorderLineStyle = (style: BorderLineStyle) => {
    setBorderLineStyle(style)
    localStorage.setItem(BORDER_LINE_STYLE_KEY, style)
    set('--border-style', style)
  }

  const handleBorderOpacity = (val: number) => {
    setBorderOpacity(val)
    localStorage.setItem(BORDER_OPACITY_KEY, String(val))
    set('--border-opacity', String(val))
  }

  const handleBorderWidth = (val: number) => {
    setBorderWidth(val)
    localStorage.setItem(BORDER_WIDTH_KEY, String(val))
    set('--border-width', `${val}px`)
  }

  const handleVignette = () => {
    const next = !vignette
    setVignette(next)
    localStorage.setItem(VIGNETTE_KEY, String(next))
    document.documentElement.classList.toggle('vignette', next)
  }

  const handleAnimations = () => {
    const next = !animations
    setAnimations(next)
    localStorage.setItem(ANIMATIONS_KEY, String(next))
    document.documentElement.classList.toggle('animations', next)
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="text-sm font-medium">Appearance</p>
        <div className="flex gap-2">
          {(['tropical', 'lounge', 'custom'] as DisplayMode[]).map(mode => (
            <Button key={mode} variant="outline"
              data-active={displayMode === mode ? 'true' : 'false'}
              className={`flex-1 capitalize${displayMode === mode ? ' border-primary text-primary' : ''}`}
              onClick={() => handleModeChange(mode)}
            >{mode}</Button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-sm font-medium">Header</p>
        <div className="flex gap-2">
          {(['solid', 'blur'] as HeaderStyle[]).map(s => (
            <Button key={s} variant="outline"
              data-active={headerStyle === s ? 'true' : 'false'}
              className={`flex-1 capitalize${headerStyle === s ? ' border-primary text-primary' : ''}`}
              onClick={() => handleHeaderStyle(s)}
            >{s}</Button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-sm font-medium">View</p>
        <ToggleRow label="Frost" checked={vignette} ariaLabel="Frost" onChange={handleVignette} />
        <ToggleRow label="Animations" checked={animations} ariaLabel="Animations" onChange={handleAnimations} />
      </section>

      <section className="space-y-3">
        <p className="text-sm font-medium">Background Image</p>
        <ImageSelector value={backgroundUrl} onChange={commitBgUrl} />
      </section>

      <section className="space-y-3">
        <p className="text-sm font-medium">Border</p>
        <div className="flex gap-2">
          {(['solid', 'dashed', 'dotted'] as BorderLineStyle[]).map(s => (
            <Button key={s} variant="outline"
              data-active={borderLineStyle === s ? 'true' : 'false'}
              className={`flex-1 capitalize${borderLineStyle === s ? ' border-primary text-primary' : ''}`}
              style={{ borderStyle: s, borderWidth: `${borderWidth}px` }}
              onClick={() => handleBorderLineStyle(s)}
            >{s}</Button>
          ))}
        </div>
        <label className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Border opacity</span>
          <input
            type="range"
            aria-label="Border opacity"
            min="0" max="1" step="0.05"
            value={borderOpacity}
            onChange={e => handleBorderOpacity(parseFloat(e.target.value))}
            className="w-32"
          />
        </label>
        <label className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Border thickness</span>
          <input
            type="range"
            aria-label="Border thickness"
            min="0.25" max="1" step="0.05"
            value={borderWidth}
            onChange={e => handleBorderWidth(parseFloat(e.target.value))}
            className="w-32"
          />
        </label>
      </section>

      <section className="space-y-3">
        <p className={`text-sm font-medium${!isCustom ? ' opacity-40' : ''}`}>Colors</p>
        <div className="flex flex-col gap-3">
          <ColorRow label="Primary button"    hex={buttonColor}          disabled={!isCustom} onChange={handleButtonColor} />
          <ColorRow label="Primary hover"     hex={hoverColor}           disabled={!isCustom} onChange={handleHoverColor} />
          <ColorRow label="Secondary button"  hex={secondaryButtonColor} disabled={!isCustom} onChange={handleSecondaryButtonColor} />
          <ColorRow label="Muted hover"       hex={mutedHoverColor}      disabled={!isCustom} onChange={handleMutedHoverColor} />
          <ColorRow label="Background"    hex={bgColor}           disabled={!isCustom} onChange={handleBgColor} />
          <ColorRow label="Font color"    hex={fontColor}         disabled={!isCustom} onChange={handleFontColor} />
          <ColorRow label="Muted text"    hex={mutedColor}        disabled={!isCustom} onChange={handleMutedColor} />
          <ColorRow label="Title color"   hex={titleColor}        disabled={!isCustom} onChange={handleTitleColor} />
          <ColorRow label="Border color"  hex={borderColor}       disabled={!isCustom} onChange={handleBorderColor} />
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-sm font-medium">Font</p>
        <div className="flex flex-wrap gap-2">
          {FONTS.map(f => (
            <Button key={f.family} aria-label={f.label} variant="outline"
              className={activeFont === f.family ? 'border-primary text-primary' : ''}
              style={{ fontFamily: f.family }}
              onClick={() => handleFont(f.family)}
            >{f.label}</Button>
          ))}
        </div>
      </section>
    </div>
  )
}
