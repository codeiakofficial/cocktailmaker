import * as React from 'react'
import { useTheme } from '../theme-provider'
import { Button } from '../ui/button'
import { ImageSelector } from '../ui/ImageSelector'
import type { DisplayMode, PresetMode, HeaderStyle, BorderLineStyle, CustomColors } from './appearance-presets'
import { PRESETS, presetToCustom } from './appearance-presets'
import {
  DISPLAY_MODE_KEY, HEADER_STYLE_KEY, CUSTOM_COLORS_KEY,
  FONT_KEY, BG_URL_KEY, BORDER_OPACITY_KEY, BORDER_WIDTH_KEY, BORDER_LINE_STYLE_KEY,
  FROST_KEY, ANIMATIONS_KEY,
  loadDisplayMode, loadCustomColors, loadFont, loadHeaderStyle,
  set, unset, CUSTOM_PROPS, COLORS,
  applyPresetColors, applyCustomColors, applyHeaderStyle, restoreAppearance,
} from './appearance-store'

export { restoreAppearance, applyHeaderStyle }

const FONTS = [
  { label: 'Oxanium',   family: "'Oxanium Variable', sans-serif" },
  { label: 'Pacifico',  family: "'Pacifico', cursive" },
  { label: 'Lobster',   family: "'Lobster', cursive" },
  { label: 'Dancing',   family: "'Dancing Script', cursive" },
  { label: 'Righteous', family: "'Righteous', sans-serif" },
  { label: 'Abril',     family: "'Abril Fatface', serif" },
  { label: 'Satisfy',   family: "'Satisfy', cursive" },
  { label: 'Playfair',  family: "'Playfair Display Variable', serif" },
  { label: 'Mono',      family: 'ui-monospace, monospace' },
]

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

interface PresetCardProps {
  mode: DisplayMode
  active: boolean
  onClick: () => void
  bgImage?: string
  bgColor?: string
  primaryColor: string
  secondaryColor: string
}

function PresetCard({ mode, active, onClick, bgImage, bgColor, primaryColor, secondaryColor }: PresetCardProps) {
  return (
    <button
      data-active={String(active)}
      aria-label={mode}
      aria-pressed={active}
      onClick={onClick}
      className={`group relative flex flex-col rounded-xl overflow-hidden transition-all focus:outline-none ${
        active
          ? 'ring-2 ring-primary shadow-lg scale-[1.02]'
          : 'ring-1 ring-border hover:ring-primary/50 hover:scale-[1.01]'
      }`}
    >
      {/* Thumbnail */}
      <div
        className="h-16 w-full bg-cover bg-center relative"
        style={{ backgroundImage: bgImage ? `url(${bgImage})` : undefined, backgroundColor: bgColor }}
      >
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-1.5 left-1.5 flex gap-1">
          <span className="block w-3 h-3 rounded-full border border-white/50 shadow" style={{ backgroundColor: primaryColor }} />
          <span className="block w-3 h-3 rounded-full border border-white/50 shadow" style={{ backgroundColor: secondaryColor }} />
        </div>
        {active && (
          <span className="absolute top-1.5 right-1.5 block w-2.5 h-2.5 rounded-full bg-primary border border-white/60 shadow" />
        )}
      </div>
      {/* Label */}
      <div className="py-1 text-center text-xs capitalize font-medium bg-card/90 text-foreground">
        {mode}
      </div>
    </button>
  )
}

export default function AppearanceSettings() {
  const { setTheme } = useTheme()
  const [displayMode,     setDisplayMode]     = React.useState<DisplayMode>(loadDisplayMode)
  const [colors,          setColors]          = React.useState<CustomColors>(() => {
    const m = loadDisplayMode()
    return m === 'custom' ? loadCustomColors() : presetToCustom(PRESETS[m].colors)
  })
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
    setDisplayMode(mode)
    localStorage.setItem(DISPLAY_MODE_KEY, mode)
    if (mode === 'custom') {
      setTheme('light')
      applyCustomColors(colors)
      localStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(colors))
      return
    }
    const p = PRESETS[mode as PresetMode]
    setTheme(p.theme)
    CUSTOM_PROPS.forEach(unset)
    applyPresetColors(p.colors)
    setColors(presetToCustom(p.colors))
    setBackgroundUrl(p.bg)
    localStorage.setItem(BG_URL_KEY, p.bg)
    set('--bg-image-url', `url("${p.bg}")`)
    if (p.font          != null) { setActiveFont(p.font);             document.documentElement.style.fontFamily = p.font; localStorage.setItem(FONT_KEY, p.font) }
    if (p.headerStyle   != null) { setHeaderStyle(p.headerStyle);     applyHeaderStyle(p.headerStyle);            localStorage.setItem(HEADER_STYLE_KEY, p.headerStyle) }
    if (p.borderStyle   != null) { setBorderLineStyle(p.borderStyle); set('--border-style', p.borderStyle);       localStorage.setItem(BORDER_LINE_STYLE_KEY, p.borderStyle) }
    if (p.borderOpacity != null) { setBorderOpacity(p.borderOpacity); set('--border-opacity', String(p.borderOpacity)); localStorage.setItem(BORDER_OPACITY_KEY, String(p.borderOpacity)) }
    if (p.borderWidth   != null) { setBorderWidth(p.borderWidth);     set('--border-width', `${p.borderWidth}px`);      localStorage.setItem(BORDER_WIDTH_KEY, String(p.borderWidth)) }
    if (p.animations    != null) { setAnimations(p.animations);       document.documentElement.classList.toggle('animations', p.animations); localStorage.setItem(ANIMATIONS_KEY, String(p.animations)) }
    if (p.frost         != null) { setFrost(p.frost);                 document.documentElement.classList.toggle('frost', p.frost);           localStorage.setItem(FROST_KEY, String(p.frost)) }
  }

  const handleColor = (cfg: typeof COLORS[number]) => (val: string) => {
    setColors(prev => ({ ...prev, [cfg.key]: val }))
    if (!isCustom) { setDisplayMode('custom'); localStorage.setItem(DISPLAY_MODE_KEY, 'custom'); setTheme('light') }
    cfg.apply(val)
  }

  const handleFont            = (v: string)        => { setActiveFont(v); document.documentElement.style.fontFamily = v; localStorage.setItem(FONT_KEY, v) }
  const handleHeaderStyle     = (s: HeaderStyle)   => { setHeaderStyle(s); applyHeaderStyle(s); localStorage.setItem(HEADER_STYLE_KEY, s) }
  const commitBgUrl           = (url: string)      => { setBackgroundUrl(url); localStorage.setItem(BG_URL_KEY, url); url ? set('--bg-image-url', `url("${url}")`) : unset('--bg-image-url') }
  const handleBorderLineStyle = (s: BorderLineStyle) => { setBorderLineStyle(s); set('--border-style', s); localStorage.setItem(BORDER_LINE_STYLE_KEY, s) }
  const handleBorderOpacity   = (v: number)        => { setBorderOpacity(v);  set('--border-opacity', String(v)); localStorage.setItem(BORDER_OPACITY_KEY, String(v)) }
  const handleBorderWidth     = (v: number)        => { setBorderWidth(v);    set('--border-width', `${v}px`);    localStorage.setItem(BORDER_WIDTH_KEY, String(v)) }
  const handleFrost      = () => { const n = !frost;      setFrost(n);      document.documentElement.classList.toggle('frost', n);      localStorage.setItem(FROST_KEY, String(n)) }
  const handleAnimations = () => { const n = !animations; setAnimations(n); document.documentElement.classList.toggle('animations', n); localStorage.setItem(ANIMATIONS_KEY, String(n)) }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="text-sm font-medium">Appearance</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(['tropical', 'lounge', 'haze'] as PresetMode[]).map(mode => (
            <PresetCard
              key={mode}
              mode={mode}
              active={displayMode === mode}
              onClick={() => handleModeChange(mode)}
              bgImage={PRESETS[mode].bg}
              primaryColor={PRESETS[mode].colors.primary}
              secondaryColor={PRESETS[mode].colors.secondary}
            />
          ))}
          <PresetCard
            mode="custom"
            active={displayMode === 'custom'}
            onClick={() => handleModeChange('custom')}
            bgColor={colors.background}
            primaryColor={colors.primary}
            secondaryColor={colors.secondary}
          />
        </div>
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
