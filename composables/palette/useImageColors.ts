import { ref } from 'vue'
import { colord, extend } from 'colord'
import mixPlugin from 'colord/plugins/mix'
extend([mixPlugin])

// Stub for extracting colors from an image
export const useImageColors = () => {
  const colors = ref<string[]>([])
  const extractColors = async (file: File) => {
    const img = new Image()
    img.src = URL.createObjectURL(file)
    await new Promise(resolve => { img.onload = resolve })
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(img, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    const colorMap = new Map<string, number>()
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2]
      const hex = colord({ r, g, b }).toHex()
      colorMap.set(hex, (colorMap.get(hex) || 0) + 1)
    }
    // Sort by frequency and pick top 8 colors
    const sorted = Array.from(colorMap.entries()).sort((a, b) => b[1] - a[1])
    colors.value = sorted.slice(0, 8).map(([hex]) => hex)
  }
  return { colors, extractColors }
}
