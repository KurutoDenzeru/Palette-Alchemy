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
import CardFooter from '@/components/ui/card/CardFooter.vue'
import CardDescription from '@/components/ui/card/CardDescription.vue'
import HoverCard from '@/components/ui/hover-card/HoverCard.vue'
import HoverCardTrigger from '@/components/ui/hover-card/HoverCardTrigger.vue'
import HoverCardContent from '@/components/ui/hover-card/HoverCardContent.vue'
import { useColorConversions } from '@/composables/palette/useColorConversions'
import { useColorAnalysis } from '@/composables/palette/useColorAnalysis'
import chroma from 'chroma-js'
import Dialog from '@/components/ui/dialog/Dialog.vue'
import DialogTrigger from '@/components/ui/dialog/DialogTrigger.vue'
import DialogContent from '@/components/ui/dialog/DialogContent.vue'
import DialogHeader from '@/components/ui/dialog/DialogHeader.vue'
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue'
import DialogFooter from '@/components/ui/dialog/DialogFooter.vue'
import DownloadIcon from '@/components/icons/DownloadIcon'
import { FileDown, FileJson, FileImage, FileType2, FileText } from 'lucide-vue-next'

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

const colorInput = ref('#e63946')
const paletteMode = ref<PaletteMode>('analogous')
const gridColumns = ref([4])
const paletteName = ref('My Palette')

const {
  palette,
  secondaryPalette,
  isLoading,
  generatePalette,
  generateRandom,
} = usePalette(colorInput, paletteMode)

const colorConversions = useColorConversions(colorInput)
const colorAnalysis = useColorAnalysis(colorInput)

const exportFormats = [
  { label: 'PNG', value: 'png', icon: FileImage },
  { label: 'JPEG', value: 'jpeg', icon: FileImage },
  { label: 'WEBP', value: 'webp', icon: FileImage },
  { label: 'CSS', value: 'css', icon: FileText },
  { label: 'JSON', value: 'json', icon: FileJson }
]
const exportFormat = ref('png')

generatePalette()

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

// Regenerate palette when paletteMode or gridColumns changes
watch([paletteMode, gridColumns], () => {
  generatePalette()
})
</script>

<template>
  <div class="min-h-screen flex flex-col md:flex-row bg-background text-foreground">
    <!-- Sidebar: Palette Controls (responsive: sidebar on md+, top bar on mobile) -->
    <aside
      class="w-full md:max-w-xs md:min-h-screen bg-card border-b md:border-b-0 md:border-r px-4 md:px-6 py-4 md:py-8 flex flex-col gap-8 md:sticky md:top-0 z-20">
      <div>
        <h2 class="text-lg font-semibold mb-1">Palette Controls</h2>
        <p class="text-muted-foreground text-sm mb-4">Pick a color, palette mode, and grid size. Generate or randomize
          your palette.</p>
        <div class="flex flex-col gap-4">
          <label class="text-sm font-medium">Base Color:</label>
          <Input v-model="colorInput" class="w-full" placeholder="HEX or RGB" />
          <label class="text-sm font-medium">Color Harmony:</label>
          <Select v-model="paletteMode">
            <SelectTrigger class="w-full">{{ paletteMode }}</SelectTrigger>
            <SelectContent>
              <SelectItem v-for="mode in MODES" :key="mode" :value="mode">{{ mode }}</SelectItem>
            </SelectContent>
          </Select>
          <div class="flex flex-col items-start w-full">
            <label class="text-xs font-medium mb-1">Grid Size: <span class="font-mono">{{ gridColumns[0]
                }}</span></label>
            <Slider v-model="gridColumns" :min="2" :max="12" :step="2" class="w-full" />
            <div class="flex justify-between w-full mt-1 text-xs text-muted-foreground font-mono select-none">
              <span v-for="n in [2,4,6,8,10,12]" :key="n">{{ n }}</span>
            </div>
          </div>
          <div class="flex gap-2 mt-2 flex-wrap">
            <Button @click="generatePalette" :disabled="isLoading" class="w-full">Generate Palette</Button>
            <Button @click="generateRandom" variant="outline" class="w-full">Generate Random</Button>
          </div>
        </div>
      </div>
      <!-- Download Dialog Trigger (responsive) -->
      <div class="mt-4 md:mt-auto">
        <Dialog>
          <DialogTrigger as-child>
            <Button
              class="w-full flex items-center justify-center gap-2 rounded-md shadow-md bg-card hover:bg-accent transition-colors"
              aria-label="Open Export Dialog" variant="outline">
              <DownloadIcon class="w-5 h-5 text-primary" />
              <span>Export Palette</span>
            </Button>
          </DialogTrigger>
          <DialogContent class="max-w-[95vw] w-full sm:max-w-md text-left">
            <DialogHeader class="text-left">
              <DialogTitle>Export Palette</DialogTitle>
            </DialogHeader>
            <div class="flex flex-col gap-2 text-left">
              <label class="text-xs font-medium">File Name</label>
              <Input v-model="paletteName" class="mb-2" placeholder="Palette name" />
              <label class="text-xs font-medium">Export Format</label>
              <Select v-model="exportFormat">
                <SelectTrigger class="w-full text-left">
                  <component :is="exportFormats.find(f => f.value === exportFormat)?.icon" class="size-4 mr-2" />
                  {{ exportFormat }}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="fmt in exportFormats" :key="fmt.value" :value="fmt.value">
                    <component :is="fmt.icon" class="size-4 mr-2" />
                    {{ fmt.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <DialogFooter>
                <Button class="mt-4 w-full">Export</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 min-h-screen px-4 md:px-8 py-4 md:py-8 flex flex-col gap-8">
      <!-- Generated Palette & Related Colors -->
      <section>
        <Card class="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Generated Palette</CardTitle>
          </CardHeader>
          <CardContent>
            <div :class="`grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-${gridColumns[0]}`"
              style="display: flex; flex-wrap: wrap;">
              <HoverCard v-for="color in palette" :key="color.hex">
                <HoverCardTrigger>
                  <div class="rounded aspect-square border border-border cursor-pointer transition hover:scale-105"
                    :style="{ background: color.hex, width: '48px', height: '48px' }" @click="handleCopy(color.hex)" />
                </HoverCardTrigger>
                <HoverCardContent>
                  <div class="flex flex-col gap-1 text-xs font-mono">
                    <span class="font-bold">HEX: <span class="cursor-pointer" @click="handleCopy(color.hex)">{{
                        color.hex }}</span></span>
                    <span>RGB: <span class="cursor-pointer" @click="handleCopy(getColorConversions(color.hex).rgb)">{{
                        getColorConversions(color.hex).rgb }}</span></span>
                    <span>HSL: <span class="cursor-pointer" @click="handleCopy(getColorConversions(color.hex).hsl)">{{
                        getColorConversions(color.hex).hsl }}</span></span>
                    <span>HWB: <span class="cursor-pointer" @click="handleCopy(getColorConversions(color.hex).hwb)">{{
                        getColorConversions(color.hex).hwb }}</span></span>
                    <span>CMYK: <span class="cursor-pointer" @click="handleCopy(getColorConversions(color.hex).cmyk)">{{
                        getColorConversions(color.hex).cmyk }}</span></span>
                    <span>LCH: <span class="cursor-pointer" @click="handleCopy(getColorConversions(color.hex).lch)">{{
                        getColorConversions(color.hex).lch }}</span></span>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
            <div class="mt-6">
              <CardTitle class="text-base mb-2">Related Colors</CardTitle>
              <div class="flex gap-2 flex-wrap">
                <HoverCard v-for="color in secondaryPalette" :key="color.hex">
                  <HoverCardTrigger>
                    <div class="rounded aspect-square border border-border cursor-pointer transition hover:scale-105"
                      :style="{ background: color.hex, width: '48px', height: '48px' }"
                      @click="handleCopy(color.hex)" />
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <div class="flex flex-col gap-1 text-xs font-mono">
                      <span class="font-bold">HEX: <span class="cursor-pointer" @click="handleCopy(color.hex)">{{
                          color.hex }}</span></span>
                      <span>RGB: <span class="cursor-pointer" @click="handleCopy(getColorConversions(color.hex).rgb)">{{
                          getColorConversions(color.hex).rgb }}</span></span>
                      <span>HSL: <span class="cursor-pointer" @click="handleCopy(getColorConversions(color.hex).hsl)">{{
                          getColorConversions(color.hex).hsl }}</span></span>
                      <span>HWB: <span class="cursor-pointer" @click="handleCopy(getColorConversions(color.hex).hwb)">{{
                          getColorConversions(color.hex).hwb }}</span></span>
                      <span>CMYK: <span class="cursor-pointer"
                          @click="handleCopy(getColorConversions(color.hex).cmyk)">{{
                          getColorConversions(color.hex).cmyk }}</span></span>
                      <span>LCH: <span class="cursor-pointer" @click="handleCopy(getColorConversions(color.hex).lch)">{{
                          getColorConversions(color.hex).lch }}</span></span>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      <!-- Color Analysis & Conversions -->
      <section class="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Color Analysis</CardTitle>
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