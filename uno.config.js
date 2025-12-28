import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(), 
    presetAttributify(),
    presetIcons(),
  ],
  // Add this to ensure PrimeVue classes play nice
  content: {
    pipeline: {
      include: [
        /\.(vue|svelte|[jt]sx|mdx?|html)($|\?)/,
        'src/**/*.{js,ts}',
      ],
    },
  },
})