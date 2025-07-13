<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { usePalette } from '@/composables/palette/usePalette'
  import Button from '@/components/ui/button/Button.vue'
  import Input from '@/components/ui/input/Input.vue'
  import Select from '@/components/ui/select/Select.vue'
  import SelectTrigger from '@/components/ui/select/SelectTrigger.vue'
  import SelectContent from '@/components/ui/select/SelectContent.vue'
  import SelectItem from '@/components/ui/select/SelectItem.vue'
  import Slider from '@/components/ui/slider/Slider.vue'
  import Card from '@/components/ui/card/Card.vue'
  import CardHeader from '@/components/ui/card/CardHeader.vue'
  import CardTitle from '@/components/ui/card/CardTitle.vue'
  import CardContent from '@/components/ui/card/CardContent.vue'
  import HoverCard from '@/components/ui/hover-card/HoverCard.vue'
  import HoverCardTrigger from '@/components/ui/hover-card/HoverCardTrigger.vue'
  import HoverCardContent from '@/components/ui/hover-card/HoverCardContent.vue'
  import { useColorConversions } from '@/composables/palette/useColorConversions'
  import { useColorAnalysis } from '@/composables/palette/useColorAnalysis'
  import chroma from 'chroma-js'
  import ExportPaletteDialog from '@/components/ExportPaletteDialog.vue'
  import { Palette, Shuffle, Copy } from 'lucide-vue-next';
  import ColorPicker from '~/components/ColorPicker.vue'
  import ImageDropZone from '@/components/ImageDropZone.vue'
  import { useImageColors } from '@/composables/palette/useImageColors'

  const MODES = [
    'analogous',
    'monochrome',
    'complementary',
    'triadic',
    'compound',
    'shades',
    'tetradic',
    'square',
  ] as const

  type PaletteMode = typeof MODES[number]

  const colorInput = ref('#dc143c')
  const paletteMode = ref<PaletteMode>('analogous')
  const gridColumns = ref([16])
  const imagePalette = ref<string[]>([])
  const lastImageFile = ref<File | null>(null)

  const {
    palette,
    secondaryPalette,
    isLoading,
    generatePalette,
    generateRandom,
  } = usePalette(colorInput, paletteMode)

  const colorConversions = useColorConversions(colorInput)
  const colorAnalysis = useColorAnalysis(colorInput)

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex)
  }

  const gridClass = computed(() => `grid-cols-${gridColumns.value[0]}`)

  // Helper to get conversions for any color
  const getColorConversions = (hex: string) => {
    if (!chroma.valid(hex)) return { hex: '', rgb: '', hsl: '', hwb: '', cmyk: '', lch: '', keyword: '' }
    const c = chroma(hex)
    const toHwb = (c: chroma.Color) => {
      const [h] = c.hsl()
      const w = Math.min(...c.rgb()) / 255
      const b = 1 - Math.max(...c.rgb()) / 255
      return `hwb(${Math.round(h)}, ${(w * 100).toFixed(0)}%, ${(b * 100).toFixed(0)}%)`
    }
    const getKeyword = (hex: string) => {
      try { return chroma(hex).name() } catch { return '' }
    }
    return {
      hex: c.hex(),
      rgb: c.css('rgb'),
      hsl: c.css('hsl'),
      hwb: toHwb(c),
      cmyk: c.cmyk().map(x => Math.round(x)).join(','),
      lch: c.lch().map(x => Math.round(x)).join(','),
      keyword: getKeyword(c.hex())
    }
  }

  function handleImageColors(colors: string[], file?: File) {
    imagePalette.value = colors
    if (colors.length) {
      palette.value = colors.map(hex => ({ hex, rgba: chroma(hex).css('rgb') }))
      // Generate related colors by brightening each extracted color
      secondaryPalette.value = colors.map(hex => {
        const lighter = chroma(hex).brighten(1).hex()
        return { hex: lighter, rgba: chroma(lighter).css('rgb') }
      })
    } else {
      generatePalette(gridColumns.value[0])
    }
    if (file) lastImageFile.value = file
  }

  watch(() => gridColumns.value[0], async (newCount) => {
    if (lastImageFile.value) {
      // Re-extract colors from the last image with new count
      const { colors, extractColors } = useImageColors()
      await extractColors(lastImageFile.value, newCount)
      handleImageColors(colors.value, lastImageFile.value)
    } else if (!imagePalette.value.length) {
      generatePalette(newCount)
    }
  })

  // Regenerate palette when paletteMode or gridColumns changes
  watch([paletteMode, () => gridColumns.value[0]], () => {
    if (!imagePalette.value.length) {
      generatePalette(gridColumns.value[0])
    }
  })

  // On initial load, generate palette with correct count
  if (!imagePalette.value.length) {
    generatePalette(gridColumns.value[0])
  }
</script>

<template>
  <div class="min-h-screen flex flex-col md:flex-row bg-background text-foreground">
    <!-- Sidebar: Palette Controls (responsive: sidebar on md+, top bar on mobile) -->
    <aside
      class="w-full md:max-w-xs md:min-h-screen bg-card border-b md:border-b-0 md:border-r px-4 md:px-6 py-4 md:py-8 flex flex-col gap-8 md:sticky md:top-0 z-20">
      <div>
        <div class="flex items-center gap-3 mb-4">
          <NuxtImg src="/pallete.png" alt="Palette Alchemy Logo" class="w-16 h-16" loading="lazy" />
        </div>
        <h2 class="text-lg font-semibold mb-1">Palette Controls</h2>
        <p class="text-muted-foreground text-sm mb-4">Pick a color, palette mode, and grid size. Generate or randomize your palette.</p>
        <div class="flex flex-col gap-4">
          <label class="text-sm font-medium">Base Color:</label>
          <div class="flex items-center gap-2 w-full">
            <Input v-model="colorInput" class="w-full" placeholder="HEX or RGB" />
            <ColorPicker v-model="colorInput" />
          </div>
          <ImageDropZone :onColorsExtracted="handleImageColors" />
          <label class="text-sm font-medium">Color Harmony:</label>
          <Select v-model="paletteMode">
            <SelectTrigger class="w-full capitalize">{{ paletteMode }}</SelectTrigger>
            <SelectContent>
              <SelectItem v-for="mode in MODES" :key="mode" :value="mode" class="capitalize">
                {{ mode }}
              </SelectItem>
            </SelectContent>
          </Select>
          <div class="flex flex-col items-start w-full">
            <label class="text-sm font-medium mb-1">Grid Size: <span class="font-mono">{{ gridColumns[0] }}</span></label>
            <Slider v-model="gridColumns" :min="4" :max="32" :step="4" class="w-full" />
            <div class="flex justify-between w-full mt-1 text-sm text-muted-foreground font-mono select-none">
              <span v-for="n in [4, 8, 12, 16, 20, 24, 28, 32]" :key="n">{{ n }}</span>
            </div>
          </div>
          <div class="flex gap-2 mt-2 flex-wrap">
            <Button @click="generatePalette" :disabled="isLoading" class="w-full">
              <Palette class="w-5 h-5" />
              Generate Palette
            </Button>
            <Button @click="generateRandom" variant="outline" class="w-full">
              <Shuffle class="w-5 h-5" />
              Generate Random
            </Button>
          </div>
        </div>
      </div>
      <!-- Download Dialog Trigger (responsive) -->
      <div class="mt-4 md:mt-auto">
        <ExportPaletteDialog :palette="palette" :isLoading="isLoading" />
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 min-h-screen flex flex-col gap-8 justify-center items-center px-4 md:px-8 py-4 md:py-8">
      <!-- Generated Palette & Related Colors -->
      <section class="w-full mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Generated Palette:</CardTitle>
          </CardHeader>
          <CardContent>
            <div :class="`grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-${gridColumns[0]}`"
              style="display: flex; flex-wrap: wrap;">
              <HoverCard v-for="color in palette" :key="color.hex" class="w-full">
                <HoverCardTrigger>
                  <div
                    class="group rounded aspect-square border border-border cursor-pointer transition hover:scale-105 bg-white hover:bg-accent/20"
                    :style="{ background: color.hex, width: '73px', height: '75px' }" @click="handleCopy(color.hex)" />
                </HoverCardTrigger>
                <HoverCardContent>
                  <div
                    class="flex flex-col gap-2 text-sm font-mono group-hover:bg-accent/10 rounded-md min-w-[350px] transition-colors">
                    <div v-for="fmt in [
                      { label: 'HEX', value: color.hex },
                      { label: 'RGB', value: getColorConversions(color.hex).rgb },
                      { label: 'HSL', value: getColorConversions(color.hex).hsl },
                      { label: 'HWB', value: getColorConversions(color.hex).hwb },
                      { label: 'CMYK', value: getColorConversions(color.hex).cmyk },
                      { label: 'LCH', value: getColorConversions(color.hex).lch }
                    ]" :key="fmt.label"
                      class="flex items-center justify-between px-2 py-2 rounded cursor-pointer transition-colors group hover:bg-gray-300/50"
                      @click="handleCopy(fmt.value)">
                      <span>
                        <span class="font-bold">{{ fmt.label }}:</span>
                        <span class="ml-2">{{ fmt.value }}</span>
                      </span>
                      <Copy class="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
            <div class="mt-6">
              <CardTitle class="text-base mb-2">Related Colors:</CardTitle>
              <div class="flex gap-2 flex-wrap">
                <HoverCard v-for="color in secondaryPalette" :key="color.hex">
                  <HoverCardTrigger>
                    <div
                      class="group rounded aspect-square border border-border cursor-pointer transition hover:scale-105 bg-white hover:bg-accent/20"
                      :style="{ background: color.hex, width: '73px', height: '75px' }"
                      @click="handleCopy(color.hex)" />
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <div
                      class="flex flex-col gap-2 text-sm font-mono group-hover:bg-accent/10 rounded-md min-w-[350px] transition-colors">
                      <div v-for="fmt in [
                        { label: 'HEX', value: color.hex },
                        { label: 'RGB', value: getColorConversions(color.hex).rgb },
                        { label: 'HSL', value: getColorConversions(color.hex).hsl },
                        { label: 'HWB', value: getColorConversions(color.hex).hwb },
                        { label: 'CMYK', value: getColorConversions(color.hex).cmyk },
                        { label: 'LCH', value: getColorConversions(color.hex).lch }
                      ]" :key="fmt.label"
                        class="flex items-center justify-between px-2 py-2 rounded cursor-pointer transition-colors group hover:bg-gray-300/50"
                        @click="handleCopy(fmt.value)">
                        <span>
                          <span class="font-bold">{{ fmt.label }}:</span>
                          <span class="ml-2">{{ fmt.value }}</span>
                        </span>
                        <Copy class="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      <!-- Color Analysis & Conversions -->
      <section class="w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Color Analysis:</CardTitle>
          </CardHeader>
          <CardContent>
            <ul class="text-sm space-y-1 font-mono">
              <li>Valid CSS Color: <span
                  :class="{ 'text-green-600': colorAnalysis.isValid, 'text-red-600': !colorAnalysis.isValid }">{{
                  colorAnalysis.isValid ? 'Yes' : 'No' }}</span></li>
              <li>Format: {{ colorAnalysis.format }}</li>
              <li>Hue: {{ colorAnalysis.hue }}°</li>
              <li>Brightness: {{ colorAnalysis.brightness }}%</li>
              <li>Luminance: {{ colorAnalysis.luminance }}%</li>
              <li>Contrast on White: {{ colorAnalysis.contrast.toFixed(2) }}:1</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul class="text-sm space-y-1 font-mono">
              <li>HEX: {{ colorConversions.hex }}</li>
              <li>RGB: {{ colorConversions.rgb }}</li>
              <li>HSL: {{ colorConversions.hsl }}</li>
              <li>HWB: {{ colorConversions.hwb }}</li>
              <li>CMYK: {{ colorConversions.cmyk }}</li>
              <li>LCH: {{ colorConversions.lch }}</li>
              <li>CSS Keyword: {{ colorConversions.keyword }}</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </main>
  </div>
</template>