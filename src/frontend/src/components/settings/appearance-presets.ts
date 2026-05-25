export type DisplayMode     = 'tropical' | 'lounge' | 'haze' | 'custom'
export type PresetMode      = Exclude<DisplayMode, 'custom'>
export type HeaderStyle     = 'solid' | 'blur'
export type BorderLineStyle = 'solid' | 'dashed' | 'dotted'

export interface PresetColors {
  background: string
  card: string
  popover: string
  foreground: string
  cardForeground: string
  primary: string
  primaryFg: string
  secondary: string
  secondaryFg: string
  mutedFg: string
  mutedHover: string
  border: string
  input: string
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
      background: '#64648a',  card: '#000',      popover: '#fef9ec',
      foreground: '#fff',     cardForeground: '#fff',
      primary: '#27b6d3',     primaryFg: '#fc54ff',
      secondary: '#d4a853',   secondaryFg: '#2c1a0e',
      mutedFg: '#c5c5c5',  mutedHover: '#c5c5c5',
      border: '#b1b6c4',      input: '#fff',        titleColor: '#fff',
    },
    bg: '/defaults/tropical.jpg', theme: 'light',
    font: "'Pacifico', cursive", headerStyle: 'blur',
    borderStyle: 'solid', borderOpacity: 0.7, borderWidth: 0.75,
    animations: true, frost: true,
  },
  lounge: {
    colors: {
      background: '#1c1c2c',              card: '#1c1c2c',   popover: '#1c1c2c',
      foreground: '#f5f5f5',              cardForeground: '#f5f5f5',
      primary: '#c0324a',                 primaryFg: '#f8f0f4',
      secondary: '#363648',               secondaryFg: '#f5f5f5',
      mutedFg: '#9697a8', mutedHover: '#454560',
      border: 'rgba(255,255,255,0.10)',   input: 'rgba(255,255,255,0.15)', titleColor: '#f0e6d3',
    },
    bg: '/defaults/lounge.jpg', theme: 'dark',
    font: "'Satisfy', cursive", headerStyle: 'blur',
    borderStyle: 'solid', borderOpacity: 0.4, borderWidth: 0.5,
    animations: false, frost: false,
  },
  haze: {
    colors: {
      background: '#0e0f1a',              card: '#0e0f1a',   popover: '#0e0f1a',
      foreground: '#e8e0f8',              cardForeground: '#e8e0f8',
      primary: '#8b6cc4',                 primaryFg: '#ffffff',
      secondary: '#2a1f4a',              secondaryFg: '#e8e0f8',
      mutedFg: '#8878a8', mutedHover: '#3a2f5e',
      border: 'rgba(180,150,255,0.15)',   input: 'rgba(180,150,255,0.20)', titleColor: '#d8c8f8',
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
  primaryHover: string
  secondary: string
  mutedHover: string
  background: string
  foreground: string
  mutedForeground: string
  titleColor: string
  border: string
}

export function presetToCustom(p: PresetColors): CustomColors {
  return {
    primary:         p.primary,
    primaryHover:    p.primary,
    secondary:       p.secondary,
    mutedHover:      p.mutedHover,
    background:      p.background,
    foreground:      p.foreground,
    mutedForeground: p.mutedFg,
    titleColor:      p.titleColor,
    border:          p.border,
  }
}
