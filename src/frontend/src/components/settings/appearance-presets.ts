export type DisplayMode     = 'tropical' | 'lounge' | 'haze' | 'custom'
export type PresetMode      = Exclude<DisplayMode, 'custom'>
export type HeaderStyle     = 'solid' | 'blur'
export type BorderLineStyle = 'solid' | 'dashed' | 'dotted'

export interface PresetColors {
  background: string
  foreground: string
  primary: string
  secondary: string
  mutedFg: string
  border: string
  titleColor: string
}

export interface Preset {
  colors: PresetColors
  bg: string
  theme: 'light' | 'dark'
  font?: string
  headerStyle?: HeaderStyle
  borderStyle?: BorderLineStyle
  borderOpacity?: number
  borderWidth?: number
  animations?: boolean
  frost?: boolean
}

// To add a preset: extend DisplayMode, PresetMode, and add an entry here.
export const PRESETS: Record<PresetMode, Preset> = {
  tropical: {
    colors: {
      background: '#64648a',  foreground: '#f5f5f5',
      primary: '#27b6d3',     secondary: '#d966b0',
      mutedFg: '#e0e0e1',
      border: '#b1b6c4',      titleColor: '#f5f5f5',
    },
    bg: '/defaults/tropical.jpg', theme: 'light',
    font: "'Pacifico', cursive", headerStyle: 'blur',
    borderStyle: 'solid', borderOpacity: 0.5, borderWidth: 0.5,
    animations: true, frost: true,
  },
  lounge: {
    colors: {
      background: '#1c1c2c',              foreground: '#f5f5f5',
      primary: '#c0324a',                 secondary: '#363648',
      mutedFg: '#9697a8',
      border: 'rgba(255,255,255,0.10)',   titleColor: '#f0e6d3',
    },
    bg: '/defaults/lounge.jpg', theme: 'dark',
    font: "'Satisfy', cursive", headerStyle: 'blur',
    borderStyle: 'solid', borderOpacity: 0.4, borderWidth: 0.5,
    animations: false, frost: false,
  },
  haze: {
    colors: {
      background: '#0e0f1a',              foreground: '#e8e0f8',
      primary: '#8b6cc4',                 secondary: '#2a1f4a',
      mutedFg: '#8878a8',
      border: 'rgba(180,150,255,0.15)',   titleColor: '#d8c8f8',
    },
    bg: '/defaults/haze.jpg', theme: 'dark',
    font: "'Oxanium Variable', sans-serif", headerStyle: 'blur',
    borderStyle: 'dotted', borderOpacity: 0.5, borderWidth: 0.5,
    animations: true, frost: true,
  },
}

// Field names mirror their CSS custom properties and UI labels.
// When entering custom mode, pickers are pre-filled from the last active preset.
export interface CustomColors {
  primary: string
  secondary: string
  background: string
  foreground: string
  mutedForeground: string
  titleColor: string
  border: string
}

export function presetToCustom(p: PresetColors): CustomColors {
  return {
    primary:         p.primary,
    secondary:       p.secondary,
    background:      p.background,
    foreground:      p.foreground,
    mutedForeground: p.mutedFg,
    titleColor:      p.titleColor,
    border:          p.border,
  }
}
