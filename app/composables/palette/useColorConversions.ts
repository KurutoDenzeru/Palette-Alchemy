import { computed, type Ref } from 'vue'
import chroma from 'chroma-js'

// Helper to sanitize color input (strip accidental ',hex' or similar)
function sanitizeColorInput(input: string): string {
  // Remove any trailing ',...' (e.g., ',hex', ',rgb', etc.)
  return input.replace(/,[^,]+$/, '').trim()
}

const getKeyword = (hex: string) => {
  try {
    return chroma(hex).name()
  } catch {
    return ''
  }
}

const toHwb = (c: chroma.Color) => {
  // HWB is not natively supported by chroma.js, so approximate
  const [h, s, l] = c.hsl()
  const w = Math.min(c.rgb()[0], c.rgb()[1], c.rgb()[2]) / 255
  const b = 1 - Math.max(c.rgb()[0], c.rgb()[1], c.rgb()[2]) / 255
  return `hwb(${Math.round(h)}, ${(w * 100).toFixed(0)}%, ${(b * 100).toFixed(0)}%)`
}

export const useColorConversions = (colorInput: Ref<string>) => {
  return computed(() => {
    const value = sanitizeColorInput(colorInput.value)
    if (!chroma.valid(value)) return { hex: '', rgb: '', hsl: '', hwb: '', cmyk: '', lch: '', keyword: '' }
    const c = chroma(value)
    return {
      hex: c.hex(),
      rgb: c.css('rgb'),
      hsl: c.css('hsl'),
      hwb: toHwb(c),
      cmyk: c.cmyk().map(x => Math.round(x)).join(','),
      lch: c.lch().map(x => Math.round(x)).join(','),
      keyword: getKeyword(c.hex())
    }
  })
}
