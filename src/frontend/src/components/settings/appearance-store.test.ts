import { describe, test, expect, beforeEach } from 'vitest'
import { ALWAYS_SET_PROPS, applyPresetColors, applyCustomColors } from './appearance-store'
import { PRESETS, presetToCustom } from './appearance-presets'

beforeEach(() => {
  document.documentElement.style.cssText = ''
})

describe('ALWAYS_SET_PROPS invariant', () => {
  test('applyPresetColors sets every property in ALWAYS_SET_PROPS', () => {
    applyPresetColors(PRESETS.lounge.colors)
    for (const prop of ALWAYS_SET_PROPS) {
      expect(
        document.documentElement.style.getPropertyValue(prop),
        `applyPresetColors must set ${prop}`
      ).not.toBe('')
    }
  })

  test('applyCustomColors sets every property in ALWAYS_SET_PROPS', () => {
    applyCustomColors(presetToCustom(PRESETS.lounge.colors))
    for (const prop of ALWAYS_SET_PROPS) {
      expect(
        document.documentElement.style.getPropertyValue(prop),
        `applyCustomColors must set ${prop}`
      ).not.toBe('')
    }
  })
})
