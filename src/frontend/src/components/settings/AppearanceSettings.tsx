import * as React from 'react'
import { useTheme } from '../theme-provider'
import { Button } from '../ui/button'
import { ImageSelector } from '../ui/ImageSelector'

type DisplayMode     = 'tropical' | 'lounge' | 'haze' | 'custom'
type PresetMode      = Exclude<DisplayMode, 'custom'>
type HeaderStyle     = 'solid' | 'blur'
type BorderLineStyle = 'solid' | 'dashed' | 'dotted'

const FONTS = [
  { label: 'Oxanium',   family: "'Oxanium Variable', sans-serif" }, { label: 'Pacifico',  family: "'Pacifico', cursive" },
  { label: 'Lobster',   family: "'Lobster', cursive" },             { label: 'Dancing',   family: "'Dancing Script', cursive" },
  { label: 'Righteous', family: "'Righteous', sans-serif" },        { label: 'Abril',     family: "'Abril Fatface', serif" },
  { label: 'Satisfy',   family: "'Satisfy', cursive" },             { label: 'Playfair',  family: "'Playfair Display Variable', serif" },
  { label: 'Mono',      family: 'ui-monospace, monospace' },
]

interface PresetColors {
  background: string; card: string; popover: string; foreground: string; cardForeground: string
  primary: string; primaryFg: string; secondary: string; secondaryFg: string
  muted: string; mutedFg: string; border: string; input: string; titleColor: string
}
interface Preset {
  colors: PresetColors; bg: string; theme: 'light' | 'dark'; font?: string; headerStyle?: HeaderStyle
  borderStyle?: BorderLineStyle; borderOpacity?: number; borderWidth?: number; animations?: boolean; frost?: boolean
}

// To add a preset: extend DisplayMode, PresetMode, and add an entry here. Keep in sync with index.html FOUC script.
const PRESETS: Record<PresetMode, Preset> = {
  tropical: {
    colors: { background: '#1a1a2e', card: '#000', popover: '#fef9ec', foreground: '#fff', cardForeground: '#ff0', primary: '#27b6d3', primaryFg: '#eee', secondary: '#d4a853', secondaryFg: '#2c1a0e', muted: '#0000e3', mutedFg: '#c5c5c5', border: '#b1b6c4', input: '#fff', titleColor: '#fff' },
    bg: '/defaults/tropical.jpg', theme: 'light', font: "'Pacifico', cursive", headerStyle: 'blur', borderStyle: 'solid', borderOpacity: 0.7, borderWidth: 0.75, animations: true, frost: true,
  },
  lounge: {
    colors: { background: '#1c1c2c', card: '#1c1c2c', popover: '#1c1c2c', foreground: '#f5f5f5', cardForeground: '#f5f5f5', primary: '#c0324a', primaryFg: '#f8f0f4', secondary: '#363648', secondaryFg: '#f5f5f5', muted: '#363648', mutedFg: '#9697a8', border: 'rgba(255,255,255,0.10)', input: 'rgba(255,255,255,0.15)', titleColor: '#f0e6d3' },
    bg: '/defaults/lounge.jpg', theme: 'dark', font: "'Satisfy', cursive", headerStyle: 'blur', borderStyle: 'solid', borderOpacity: 0.4, borderWidth: 0.5, animations: false, frost: false,
  },
  haze: {
    colors: { background: '#0e0f1a', card: '#0e0f1a', popover: '#0e0f1a', foreground: '#e8e0f8', cardForeground: '#e8e0f8', primary: '#8b6cc4', primaryFg: '#ffffff', secondary: '#2a1f4a', secondaryFg: '#e8e0f8', muted: '#2a1f4a', mutedFg: '#8878a8', border: 'rgba(180,150,255,0.15)', input: 'rgba(180,150,255,0.20)', titleColor: '#d8c8f8' },
    bg: '/defaults/haze.jpg', theme: 'dark', font: "'Oxanium Variable', sans-serif", headerStyle: 'blur', borderStyle: 'dotted', borderOpacity: 0.5, borderWidth: 0.5, animations: true, frost: true,
  },
}

// Field names mirror their CSS custom properties and UI labels.
// Pickers always reflect the active preset; custom inherits the last preset on entry.
interface CustomColors {
  primary: string; primaryHover: string; secondary: string; mutedHover: string
  background: string; foreground: string; mutedForeground: string; titleColor: string; border: string
}

// Single config drives both the color picker UI and DOM application.
const COLORS: { key: keyof CustomColors; label: string; apply: (v: string) => void }[] = [
  { key: 'primary',         label: 'Primary button',   apply: v => set('--primary', v) },
  { key: 'primaryHover',    label: 'Primary hover',    apply: v => set('--primary-hover', v) },
  { key: 'secondary',       label: 'Secondary button', apply: v => { set('--secondary', v); set('--secondary-foreground', '#ffffff') } },
  { key: 'mutedHover',      label: 'Muted hover',      apply: v => set('--muted-hover', v) },
  { key: 'background',      label: 'Background',       apply: v => { set('--background', v); set('--card', v); set('--popover', v) } },
  { key: 'foreground',      label: 'Font color',       apply: v => { set('--foreground', v); set('--card-foreground', v); set('--popover-foreground', v) } },
  { key: 'mutedForeground', label: 'Muted text',       apply: v => set('--muted-foreground', v) },
  { key: 'titleColor',      label: 'Title color',      apply: v => set('--title-color', v) },
  { key: 'border',          label: 'Border color',     apply: v => { set('--border', v); set('--input', v) } },
]

function presetToCustom(p: PresetColors): CustomColors {
  return { primary: p.primary, primaryHover: p.primary, secondary: p.secondary, mutedHover: p.muted,
    background: p.background, foreground: p.foreground, mutedForeground: p.mutedFg, titleColor: p.titleColor, border: p.border }
}

const DISPLAY_MODE_KEY = 'vite-ui-display-mode', HEADER_STYLE_KEY = 'vite-ui-header-style', CUSTOM_COLORS_KEY = 'vite-ui-custom-colors'
const FONT_KEY = 'vite-ui-font', BG_URL_KEY = 'vite-ui-bg-url'
const BORDER_OPACITY_KEY = 'vite-ui-border-opacity', BORDER_WIDTH_KEY = 'vite-ui-border-width', BORDER_LINE_STYLE_KEY = 'vite-ui-border-line-style'
const FROST_KEY = 'vite-ui-frost', ANIMATIONS_KEY = 'vite-ui-animations'

function loadDisplayMode(): DisplayMode {
  const s = localStorage.getItem(DISPLAY_MODE_KEY)
  return (s === 'tropical' || s === 'lounge' || s === 'haze' || s === 'custom') ? s : 'lounge'
}

function loadCustomColors(): CustomColors {
  const d = presetToCustom(PRESETS.lounge.colors)
  try {
    const r = JSON.parse(localStorage.getItem(CUSTOM_COLORS_KEY) ?? 'null')
    if (!r) return d
    // Migrate old field names (button→primary, hover→primaryHover, bg→background, etc.)
    return {
      primary:         r.primary         ?? r.button          ?? d.primary,
      primaryHover:    r.primaryHover     ?? r.hover           ?? d.primaryHover,
      secondary:       r.secondary        ?? r.secondaryButton ?? d.secondary,
      mutedHover:      r.mutedHover       ?? d.mutedHover,
      background:      r.background       ?? r.bg              ?? d.background,
      foreground:      r.foreground       ?? r.font            ?? d.foreground,
      mutedForeground: r.mutedForeground  ?? r.muted           ?? d.mutedForeground,
      titleColor:      r.titleColor       ?? r.title           ?? d.titleColor,
      border:          r.border           ?? d.border,
    }
  } catch { return d }
}

function loadFont(): string { return localStorage.getItem(FONT_KEY) ?? FONTS[0].family }
function loadHeaderStyle(): HeaderStyle { return localStorage.getItem(HEADER_STYLE_KEY) === 'blur' ? 'blur' : 'solid' }

const set   = (p: string, v: string) => document.documentElement.style.setProperty(p, v)
const unset = (p: string)            => document.documentElement.style.removeProperty(p)
const CUSTOM_PROPS = ['--primary', '--primary-foreground', '--primary-hover', '--secondary', '--secondary-foreground', '--background', '--card', '--popover', '--foreground', '--card-foreground', '--popover-foreground', '--muted', '--muted-foreground', '--title-color', '--border', '--input', '--muted-hover']

function applyPresetColors(p: PresetColors) {
  set('--background', p.background); set('--card', p.card); set('--popover', p.popover); set('--foreground', p.foreground)
  set('--card-foreground', p.cardForeground); set('--popover-foreground', p.foreground); set('--primary', p.primary); set('--primary-foreground', p.primaryFg)
  set('--secondary', p.secondary); set('--secondary-foreground', p.secondaryFg); set('--muted', p.muted); set('--muted-foreground', p.mutedFg)
  set('--border', p.border); set('--input', p.input); set('--title-color', p.titleColor)
}

function applyCustomColors(c: CustomColors) {
  set('--primary', c.primary); set('--primary-foreground', '#ffffff'); set('--primary-hover', c.primaryHover); set('--secondary', c.secondary)
  set('--secondary-foreground', '#ffffff'); set('--muted-hover', c.mutedHover); set('--background', c.background); set('--card', c.background)
  set('--popover', c.background); set('--foreground', c.foreground); set('--card-foreground', c.foreground); set('--popover-foreground', c.foreground)
  set('--muted-foreground', c.mutedForeground); set('--title-color', c.titleColor); set('--border', c.border); set('--input', c.border)
}

export function applyHeaderStyle(s: HeaderStyle) { s === 'blur' ? set('--header-bg', 'color-mix(in oklab, var(--background) 10%, transparent)') : unset('--header-bg') }

export function restoreAppearance() {
  const mode = loadDisplayMode(), preset = PRESETS[mode as PresetMode]
  if (preset) applyPresetColors(preset.colors)
  else        applyCustomColors(loadCustomColors())
  const font = localStorage.getItem(FONT_KEY); if (font) document.documentElement.style.fontFamily = font
  const bg = localStorage.getItem(BG_URL_KEY); if (bg) set('--bg-image-url', `url("${bg}")`); else unset('--bg-image-url')
  const bo = localStorage.getItem(BORDER_OPACITY_KEY);    if (bo) set('--border-opacity', bo)
  const bw = localStorage.getItem(BORDER_WIDTH_KEY);      if (bw) set('--border-width', `${bw}px`)
  const bs = localStorage.getItem(BORDER_LINE_STYLE_KEY); if (bs) set('--border-style', bs)
  if (localStorage.getItem(FROST_KEY)      === 'true') document.documentElement.classList.add('frost')
  if (localStorage.getItem(ANIMATIONS_KEY) === 'true') document.documentElement.classList.add('animations')
}

interface ColorRowProps { label: string; value: string; disabled: boolean; onChange: (v: string) => void }
function ColorRow({ label, value, disabled, onChange }: ColorRowProps) {
  return (
    <label className={`flex items-center justify-between text-sm${disabled ? ' opacity-40 pointer-events-none' : ''}`}>
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-mono">{value}</span>
        <input type="color" value={value} disabled={disabled} onChange={e => onChange(e.target.value)}
          className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent p-0.5 disabled:cursor-not-allowed" />
      </div>
    </label>
  )
}

interface ToggleRowProps { label: string; checked: boolean; ariaLabel: string; onChange: () => void }
function ToggleRow({ label, checked, ariaLabel, onChange }: ToggleRowProps) {
  return (
    <label className="flex items-center justify-between text-sm cursor-pointer select-none">
      <span className="text-muted-foreground">{label}</span>
      <button role="switch" aria-label={ariaLabel} aria-checked={checked} onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-primary' : 'bg-muted-foreground/20'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </label>
  )
}

function BtnGroup<T extends string>({ options, active, onChange, style }: {
  options: T[]; active: T; onChange: (v: T) => void; style?: (v: T) => React.CSSProperties
}) {
  return (
    <div className="flex gap-2">
      {options.map(v => (
        <Button key={v} variant="outline" data-active={String(active === v)}
          className={`flex-1 capitalize${active === v ? ' border-primary text-primary' : ''}`}
          style={style?.(v)} onClick={() => onChange(v)}
        >{v}</Button>
      ))}
    </div>
  )
}

export default function AppearanceSettings() {
  const { setTheme } = useTheme()
  const [displayMode,     setDisplayMode]     = React.useState<DisplayMode>(loadDisplayMode)
  const [colors,          setColors]          = React.useState<CustomColors>(() => { const m = loadDisplayMode(); return m === 'custom' ? loadCustomColors() : presetToCustom(PRESETS[m].colors) })
  const [activeFont,      setActiveFont]      = React.useState(loadFont)
  const [headerStyle,     setHeaderStyle]     = React.useState<HeaderStyle>(loadHeaderStyle)
  const [backgroundUrl,   setBackgroundUrl]   = React.useState(() => localStorage.getItem(BG_URL_KEY) ?? '')
  const [borderLineStyle, setBorderLineStyle] = React.useState<BorderLineStyle>(() => (localStorage.getItem(BORDER_LINE_STYLE_KEY) as BorderLineStyle) ?? 'solid')
  const [borderOpacity,   setBorderOpacity]   = React.useState(() => parseFloat(localStorage.getItem(BORDER_OPACITY_KEY) ?? '1'))
  const [borderWidth,     setBorderWidth]     = React.useState(() => parseFloat(localStorage.getItem(BORDER_WIDTH_KEY) ?? '1'))
  const [frost,           setFrost]           = React.useState(() => localStorage.getItem(FROST_KEY) === 'true')
  const [animations,      setAnimations]      = React.useState(() => localStorage.getItem(ANIMATIONS_KEY) === 'true')

  const isCustom = displayMode === 'custom'

  React.useEffect(() => {
    if (isCustom) localStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(colors))
  }, [colors, isCustom])

  const handleModeChange = (mode: DisplayMode) => {
    setDisplayMode(mode); localStorage.setItem(DISPLAY_MODE_KEY, mode)
    if (mode === 'custom') { setTheme('light'); applyCustomColors(colors); localStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(colors)); return }
    const p = PRESETS[mode]
    setTheme(p.theme); CUSTOM_PROPS.forEach(unset); applyPresetColors(p.colors); setColors(presetToCustom(p.colors))
    setBackgroundUrl(p.bg); localStorage.setItem(BG_URL_KEY, p.bg); set('--bg-image-url', `url("${p.bg}")`)
    if (p.font          != null) { setActiveFont(p.font);             document.documentElement.style.fontFamily = p.font; localStorage.setItem(FONT_KEY, p.font) }
    if (p.headerStyle   != null) { setHeaderStyle(p.headerStyle);     applyHeaderStyle(p.headerStyle);    localStorage.setItem(HEADER_STYLE_KEY, p.headerStyle) }
    if (p.borderStyle   != null) { setBorderLineStyle(p.borderStyle); set('--border-style', p.borderStyle); localStorage.setItem(BORDER_LINE_STYLE_KEY, p.borderStyle) }
    if (p.borderOpacity != null) { setBorderOpacity(p.borderOpacity); set('--border-opacity', String(p.borderOpacity)); localStorage.setItem(BORDER_OPACITY_KEY, String(p.borderOpacity)) }
    if (p.borderWidth   != null) { setBorderWidth(p.borderWidth);     set('--border-width', `${p.borderWidth}px`);       localStorage.setItem(BORDER_WIDTH_KEY, String(p.borderWidth)) }
    if (p.animations    != null) { setAnimations(p.animations);       document.documentElement.classList.toggle('animations', p.animations); localStorage.setItem(ANIMATIONS_KEY, String(p.animations)) }
    if (p.frost         != null) { setFrost(p.frost);                 document.documentElement.classList.toggle('frost', p.frost);           localStorage.setItem(FROST_KEY, String(p.frost)) }
  }

  const handleColor = (cfg: typeof COLORS[number]) => (val: string) => {
    setColors(prev => ({ ...prev, [cfg.key]: val }))
    if (!isCustom) { setDisplayMode('custom'); localStorage.setItem(DISPLAY_MODE_KEY, 'custom'); setTheme('light') }
    cfg.apply(val)
  }

  const handleFont        = (v: string)      => { setActiveFont(v); document.documentElement.style.fontFamily = v; localStorage.setItem(FONT_KEY, v) }
  const handleHeaderStyle = (s: HeaderStyle) => { setHeaderStyle(s); applyHeaderStyle(s); localStorage.setItem(HEADER_STYLE_KEY, s) }
  const commitBgUrl       = (url: string)    => { setBackgroundUrl(url); localStorage.setItem(BG_URL_KEY, url); url ? set('--bg-image-url', `url("${url}")`) : unset('--bg-image-url') }
  const handleBorderLineStyle = (s: BorderLineStyle) => { setBorderLineStyle(s); set('--border-style', s); localStorage.setItem(BORDER_LINE_STYLE_KEY, s) }
  const handleBorderOpacity   = (v: number) => { setBorderOpacity(v); set('--border-opacity', String(v));  localStorage.setItem(BORDER_OPACITY_KEY, String(v)) }
  const handleBorderWidth     = (v: number) => { setBorderWidth(v);   set('--border-width', `${v}px`);     localStorage.setItem(BORDER_WIDTH_KEY, String(v)) }
  const handleFrost      = () => { const n = !frost;      setFrost(n);      document.documentElement.classList.toggle('frost', n);      localStorage.setItem(FROST_KEY, String(n)) }
  const handleAnimations = () => { const n = !animations; setAnimations(n); document.documentElement.classList.toggle('animations', n); localStorage.setItem(ANIMATIONS_KEY, String(n)) }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="text-sm font-medium">Appearance</p>
        <BtnGroup options={['tropical', 'lounge', 'haze', 'custom'] as DisplayMode[]} active={displayMode} onChange={handleModeChange} />
      </section>

      <section className="space-y-3">
        <p className="text-sm font-medium">Header</p>
        <BtnGroup options={['solid', 'blur'] as HeaderStyle[]} active={headerStyle} onChange={handleHeaderStyle} />
      </section>

      <section className="space-y-3">
        <p className="text-sm font-medium">View</p>
        <ToggleRow label="Frost" checked={frost} ariaLabel="Frost" onChange={handleFrost} />
        <ToggleRow label="Animations" checked={animations} ariaLabel="Animations" onChange={handleAnimations} />
      </section>

      <section className="space-y-3">
        <p className="text-sm font-medium">Background Image</p>
        <ImageSelector value={backgroundUrl} onChange={commitBgUrl} />
      </section>

      <section className="space-y-3">
        <p className="text-sm font-medium">Border</p>
        <BtnGroup options={['solid', 'dashed', 'dotted'] as BorderLineStyle[]} active={borderLineStyle} onChange={handleBorderLineStyle}
          style={s => ({ borderStyle: s, borderWidth: `${borderWidth}px` })} />
        <label className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Border opacity</span>
          <input type="range" aria-label="Border opacity" min="0" max="1" step="0.05"
            value={borderOpacity} onChange={e => handleBorderOpacity(parseFloat(e.target.value))} className="w-32" />
        </label>
        <label className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Border thickness</span>
          <input type="range" aria-label="Border thickness" min="0.25" max="1" step="0.05"
            value={borderWidth} onChange={e => handleBorderWidth(parseFloat(e.target.value))} className="w-32" />
        </label>
      </section>

      <section className="space-y-3">
        <p className={`text-sm font-medium${!isCustom ? ' opacity-40' : ''}`}>Colors</p>
        <div className="flex flex-col gap-3">
          {COLORS.map(cfg => (
            <ColorRow key={cfg.key} label={cfg.label} value={colors[cfg.key]} disabled={!isCustom} onChange={handleColor(cfg)} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-sm font-medium">Font</p>
        <div className="flex flex-wrap gap-2">
          {FONTS.map(f => (
            <Button key={f.family} aria-label={f.label} variant="outline"
              className={activeFont === f.family ? 'border-primary text-primary' : ''}
              style={{ fontFamily: f.family }} onClick={() => handleFont(f.family)}
            >{f.label}</Button>
          ))}
        </div>
      </section>
    </div>
  )
}
