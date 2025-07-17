import { computed, type Ref } from 'vue'
import chroma from 'chroma-js'

export const useColorAnalysis = (colorInput: Ref<string>) => {
  return computed(() => {
    const value = colorInput.value
    const isValid = chroma.valid(value)
    let format = 'Unknown', hue = 0, brightness = 0, luminance = 0, contrast = 0
    if (isValid) {
      const c = chroma(value)
      // Guess format from input string
      if (/^#/.test(value)) format = 'HEX'
      else if (/rgb/i.test(value)) format = 'RGB'
      else if (/hsl/i.test(value)) format = 'HSL'
      else format = 'Other'
      hue = Math.round(c.get('hsl.h') ?? 0)
      brightness = Math.round(c.get('hsl.l') * 100)
      luminance = Math.round(c.luminance() * 100)
      contrast = chroma.contrast(c, 'white')
    }
    return { isValid, format, hue, brightness, luminance, contrast }
  })
}
