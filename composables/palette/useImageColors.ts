import { ref } from 'vue'

// Stub for extracting colors from an image
export const useImageColors = () => {
  const colors = ref<string[]>([])
  const extractColors = async (file: File) => {
    // TODO: implement image color extraction (e.g., using color-thief, colord, or chroma.js)
    // For now, just return an empty array
    colors.value = []
  }
  return { colors, extractColors }
}
