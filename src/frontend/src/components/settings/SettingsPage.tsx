import * as React from 'react'
import { COLOR_THEMES, applyColorTheme, saveColorTheme, loadColorTheme } from '../../contexts/ColorTheme'
import type { ColorTheme } from '../../contexts/ColorTheme'
import { useTheme } from '../theme-provider'

type Mode = 'light' | 'dark' | 'system'
const MODES: { label: string; value: Mode }[] = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [activeTheme, setActiveTheme] = React.useState<ColorTheme>(() => loadColorTheme())

  const selectColorTheme = (t: ColorTheme) => {
    applyColorTheme(t)
    saveColorTheme(t)
    setActiveTheme(t)
  }

  return (
    <div className="container mx-auto py-10 space-y-10 max-w-sm">
      <section className="space-y-3">
        <p className="text-sm font-medium">Color theme</p>
        <div className="flex flex-wrap gap-2">
          {COLOR_THEMES.map(t => (
            <button
              key={t.id}
              aria-label={t.name}
              data-active={activeTheme.id === t.id ? 'true' : 'false'}
              onClick={() => selectColorTheme(t)}
              className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors
                ${activeTheme.id === t.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50'}`}
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: t.light.primary }}
              />
              {t.name}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-sm font-medium">Appearance</p>
        <div className="flex gap-2">
          {MODES.map(({ label, value }) => (
            <button
              key={value}
              aria-label={label}
              data-active={theme === value ? 'true' : 'false'}
              onClick={() => setTheme(value)}
              className={`flex-1 rounded-md border px-3 py-1.5 text-sm transition-colors
                ${theme === value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
