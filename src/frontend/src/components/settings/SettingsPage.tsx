import * as React from 'react'
import { useTheme } from '../theme-provider'
import { Button } from '../ui/button'

type DisplayMode = 'light' | 'dark' | 'custom'

const FONTS = [
  { label: 'Oxanium',       family: "'Oxanium Variable', sans-serif" },
  { label: 'Pacifico',      family: "'Pacifico', cursive" },
  { label: 'Lobster',       family: "'Lobster', cursive" },
  { label: 'Dancing',       family: "'Dancing Script', cursive" },
  { label: 'Righteous',     family: "'Righteous', sans-serif" },
  { label: 'Abril',         family: "'Abril Fatface', serif" },
  { label: 'Satisfy',       family: "'Satisfy', cursive" },
  { label: 'Playfair',      family: "'Playfair Display Variable', serif" },
  { label: 'Mono',          family: 'ui-monospace, monospace' },
]

// Standard dark palette — applied when Light/Dark cleared back to dark defaults
const TROPICAL_LIGHT = {
  background:      '#fef9ec',
  card:            '#fef9ec',
  popover:         '#fef9ec',
  foreground:      '#2c1a0e',
  cardForeground:  '#2c1a0e',
  primary:         '#e67e22',
  primaryFg:       '#ffffff',
  muted:           '#f5e6c8',
  mutedFg:         '#92400e',
  border:          '#d4a853',
  input:           '#d4a853',
  titleColor:      '#c0392b',
}

const CUSTOM_PROPS = [
  '--primary', '--primary-foreground',
  '--background', '--card', '--popover',
  '--foreground', '--card-foreground', '--popover-foreground',
  '--muted', '--muted-foreground',
  '--title-color', '--border', '--input', '--primary-hover', '--muted-hover',
]

const set = (prop: string, val: string) => document.documentElement.style.setProperty(prop, val)
const unset = (prop: string) => document.documentElement.style.removeProperty(prop)

function clearCustomOverrides() {
  CUSTOM_PROPS.forEach(unset)
}

function applyTropicalLight() {
  const p = TROPICAL_LIGHT
  set('--background', p.background);      set('--card', p.card);          set('--popover', p.popover)
  set('--foreground', p.foreground);      set('--card-foreground', p.cardForeground)
  set('--popover-foreground', p.foreground)
  set('--primary', p.primary);            set('--primary-foreground', p.primaryFg)
  set('--muted', p.muted);                set('--muted-foreground', p.mutedFg)
  set('--border', p.border);              set('--input', p.input)
  set('--title-color', p.titleColor)
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

export default function SettingsPage() {
  const { setTheme } = useTheme()
  const [displayMode,  setDisplayMode]  = React.useState<DisplayMode>('dark')
  const [buttonColor,  setButtonColor]  = React.useState('#d4274a')
  const [hoverColor,   setHoverColor]   = React.useState('#a01e38')
  const [bgColor,      setBgColor]      = React.useState('#1a1a2e')
  const [fontColor,    setFontColor]    = React.useState('#f5f5f5')
  const [mutedColor,   setMutedColor]   = React.useState('#9a9ab0')
  const [titleColor,   setTitleColor]   = React.useState('#ffffff')
  const [borderColor,    setBorderColor]    = React.useState('#2e2e3a')
  const [mutedHoverColor, setMutedHoverColor] = React.useState('#2e2e4a')
  const [activeFont,     setActiveFont]     = React.useState(FONTS[0].family)

  const isCustom = displayMode === 'custom'

  const enterCustom = () => { setDisplayMode('custom'); setTheme('light') }

  const applyAllCustom = (btn: string, hover: string, bg: string, font: string, muted: string, title: string, border: string, mutedHover: string, fontFam: string) => {
    set('--background', bg); set('--card', bg); set('--popover', bg)
    set('--foreground', font); set('--card-foreground', font); set('--popover-foreground', font)
    set('--muted-foreground', muted)
    set('--primary', btn); set('--primary-foreground', '#ffffff')
    set('--primary-hover', hover)
    set('--muted-hover', mutedHover)
    set('--title-color', title)
    set('--border', border); set('--input', border)
    document.documentElement.style.fontFamily = fontFam
  }

  const handleModeChange = (mode: DisplayMode) => {
    setDisplayMode(mode)
    if (mode === 'dark')   { setTheme('dark');  clearCustomOverrides() }
    else if (mode === 'light') { setTheme('light'); clearCustomOverrides(); applyTropicalLight() }
    else { enterCustom(); applyAllCustom(buttonColor, hoverColor, bgColor, fontColor, mutedColor, titleColor, borderColor, mutedHoverColor, activeFont) }
  }

  const picker = (setter: (v: string) => void, apply: (v: string) => void) => (v: string) => {
    setter(v); if (!isCustom) enterCustom(); apply(v)
  }

  const handleButtonColor  = picker(setButtonColor,  v => set('--primary', v))
  const handleHoverColor   = picker(setHoverColor,   v => set('--primary-hover', v))
  const handleBgColor      = picker(setBgColor,      v => { set('--background', v); set('--card', v); set('--popover', v) })
  const handleFontColor    = picker(setFontColor,    v => { set('--foreground', v); set('--card-foreground', v); set('--popover-foreground', v) })
  const handleMutedColor   = picker(setMutedColor,   v => set('--muted-foreground', v))
  const handleTitleColor   = picker(setTitleColor,   v => set('--title-color', v))
  const handleBorderColor    = picker(setBorderColor,    v => { set('--border', v); set('--input', v) })
  const handleMutedHoverColor = picker(setMutedHoverColor, v => set('--muted-hover', v))
  const handleFont         = (v: string) => { setActiveFont(v); document.documentElement.style.fontFamily = v }

  return (
    <div className="w-full max-w-sm max-h-[calc(100vh-9rem)] overflow-y-auto rounded-xl bg-background/70 backdrop-blur-md p-8 shadow-lg space-y-8">

      <section className="space-y-3">
        <p className="text-sm font-medium">Appearance</p>
        <div className="flex gap-2">
          {(['light', 'dark', 'custom'] as DisplayMode[]).map(mode => (
            <Button key={mode} variant="outline"
              data-active={displayMode === mode ? 'true' : 'false'}
              className={`flex-1 capitalize${displayMode === mode ? ' border-primary text-primary' : ''}`}
              onClick={() => handleModeChange(mode)}
            >{mode}</Button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <p className={`text-sm font-medium${!isCustom ? ' opacity-40' : ''}`}>Colors</p>
        <div className="flex flex-col gap-3">
          <ColorRow label="Button color"   hex={buttonColor}      disabled={!isCustom} onChange={handleButtonColor} />
          <ColorRow label="Button hover"   hex={hoverColor}       disabled={!isCustom} onChange={handleHoverColor} />
          <ColorRow label="Muted hover"    hex={mutedHoverColor}  disabled={!isCustom} onChange={handleMutedHoverColor} />
          <ColorRow label="Background"     hex={bgColor}      disabled={!isCustom} onChange={handleBgColor} />
          <ColorRow label="Font color"     hex={fontColor}    disabled={!isCustom} onChange={handleFontColor} />
          <ColorRow label="Muted text"     hex={mutedColor}   disabled={!isCustom} onChange={handleMutedColor} />
          <ColorRow label="Title color"    hex={titleColor}   disabled={!isCustom} onChange={handleTitleColor} />
          <ColorRow label="Border color"   hex={borderColor}  disabled={!isCustom} onChange={handleBorderColor} />
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-sm font-medium">Font</p>
        <div className="flex flex-wrap gap-2">
          {FONTS.map(f => (
            <Button key={f.family} aria-label={f.label} variant="outline"
              className={`${activeFont === f.family ? 'border-primary text-primary' : ''}`}
              style={{ fontFamily: f.family }}
              onClick={() => handleFont(f.family)}
            >{f.label}</Button>
          ))}
        </div>
      </section>

    </div>
  )
}
