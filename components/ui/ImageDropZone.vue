<script setup lang="ts">
import { ref } from 'vue'
import { useImageColors } from '@/composables/palette/useImageColors'
import { Image } from 'lucide-vue-next'

const props = defineProps<{ onColorsExtracted?: (colors: string[]) => void }>()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const { colors, extractColors } = useImageColors()

async function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    await extractColors(files[0])
    if (props.onColorsExtracted) props.onColorsExtracted(colors.value)
  }
}
async function handleFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length > 0) {
    await extractColors(files[0])
    if (props.onColorsExtracted) props.onColorsExtracted(colors.value)
  }
}
function handleDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}
function handleDragLeave(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
}
</script>

<template>
  <div class="w-full flex flex-col items-center justify-center">
    <label class="block w-full cursor-pointer" @dragover="handleDragOver" @dragleave="handleDragLeave"
      @drop="handleDrop" :class="[
        'border-1 border-dashed rounded-lg transition-colors',
        isDragging ? 'border-primary bg-primary/10' : 'border-gray-400',
        'border-[3px] border-dashed',
        'flex flex-col items-center justify-center min-h-[120px] relative',
      ]">
      <input ref="fileInput" type="file" accept="image/*"
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" @change="handleFileChange" />
      <div class="pointer-events-none flex flex-col items-center justify-center gap-2 z-0 p-5">
        <Image class="w-12 h-12 text-gray-500" />
        <span class="text-sm font-medium text-gray-700 text-center">Drop an image here or click to upload</span>
      </div>
    </label>
  </div>
</template>
