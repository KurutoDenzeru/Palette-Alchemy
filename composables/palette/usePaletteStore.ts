import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PaletteColor, PaletteMode } from '@/types/palette'

export const usePaletteStore = defineStore('palette', () => {
  const colorInput = ref('')
  const paletteMode = ref<PaletteMode>('analogous')
  const palette = ref<PaletteColor[]>([])
  const secondaryPalette = ref<PaletteColor[]>([])
  const columns = ref(4)
  return { colorInput, paletteMode, palette, secondaryPalette, columns }
})
