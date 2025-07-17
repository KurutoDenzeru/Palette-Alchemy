import { ref, computed, type Ref } from 'vue'
import chroma from 'chroma-js'

const MODES = [
  'analogous',
  'monochrome',
  'complementary',
  'triadic',
  'compound',
  'shades',
  'tetradic',
  'square'
] as const

type PaletteMode = typeof MODES[number]

type PaletteColor = {
  hex: string
  rgba: string
}

export const usePalette = (
  colorInput: Ref<string>,
  paletteMode: Ref<PaletteMode>
) => {
  const palette = ref<PaletteColor[]>([])
  const secondaryPalette = ref<PaletteColor[]>([])
  const isLoading = ref(false)

  const getRgba = (hex: string) => {
    const c = chroma(hex)
    const [r, g, b, a] = c.rgba()
    return `rgba(${r},${g},${b},${a})`
  }

  // Accept count argument for number of colors
  const generatePalette = (count = 6) => {
    isLoading.value = true
    try {
      const base = chroma.valid(colorInput.value) ? chroma(colorInput.value) : chroma.random()
      let colors: string[] = []
      switch (paletteMode.value) {
        case 'analogous':
          colors = chroma.scale([base.set('hsl.h', '-30'), base.hex(), base.set('hsl.h', '+30')]).mode('lch').colors(count)
          break
        case 'monochrome':
          colors = chroma.scale([base.brighten(2).hex(), base.darken(2).hex()]).mode('lab').colors(count)
          break
        case 'complementary':
          colors = [base.hex(), base.set('hsl.h', "+180").hex()]
          break
        case 'triadic':
          colors = [base.hex(), base.set('hsl.h', "+120").hex(), base.set('hsl.h', "+240").hex()]
          break
        case 'compound':
          colors = [base.hex(), base.set('hsl.h', "+150").hex(), base.set('hsl.h', "+210").hex()]
          break
        case 'shades':
          colors = chroma.scale([base.brighten(2).hex(), base.darken(2).hex()]).mode('lab').colors(count)
          break
        case 'tetradic':
          colors = [base.hex(), base.set('hsl.h', "+90").hex(), base.set('hsl.h', "+180").hex(), base.set('hsl.h', "+270").hex()]
          break
        case 'square':
          colors = [base.hex(), base.set('hsl.h', "+90").hex(), base.set('hsl.h', "+180").hex(), base.set('hsl.h', "+270").hex()]
          break
        default:
          colors = chroma.scale([base.set('hsl.h', '-30'), base.hex(), base.set('hsl.h', '+30')]).mode('lch').colors(count)
      }
      palette.value = colors.map(hex => ({ hex, rgba: getRgba(hex) }))
      secondaryPalette.value = colors.map(hex => {
        const lighter = chroma(hex).brighten(1).hex()
        return { hex: lighter, rgba: getRgba(lighter) }
      })
    } finally {
      isLoading.value = false
    }
  }

  const generateRandom = () => {
    colorInput.value = chroma.random().hex()
    generatePalette()
  }

  return {
    palette,
    secondaryPalette,
    isLoading,
    generatePalette,
    generateRandom
  }
}
