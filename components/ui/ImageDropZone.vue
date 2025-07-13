<script setup lang="ts">
import { ref, watch } from 'vue'
import { useImageColors } from '@/composables/palette/useImageColors'
import { Image } from 'lucide-vue-next'

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const { colors, extractColors } = useImageColors()

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    extractColors(files[0])
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
function handleFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length > 0) {
    extractColors(files[0])
  }
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
        <span class="text-lg font-semibold text-gray-700">Drop an image here or click to upload</span>
        <span class="text-sm text-gray-500">(Supported: PNG, JPEG, WEBP, etc. Palette is generated automatically.)</span>
      </div>
    </label>
    <div v-if="colors.length" class="flex flex-wrap gap-2 mt-4">
      <div v-for="color in colors" :key="color" :style="{ background: color }" class="w-8 h-8 rounded shadow border" />
    </div>
  </div>
</template>
