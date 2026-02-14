import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2024-11-01',
  css: [
    'quasar/src/css/index.sass',
    '@quasar/extras/material-icons/material-icons.css',
  ],
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || '',
    },
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/icon',
    '@nuxt/fonts',
    'nuxt-quasar-ui',
    '@pinia/nuxt',
  ],
  quasar: {
    plugins: ['Notify'],
    config: {
      brand: {
        primary: '#07AE86',
        secondary: '#E05B3D',
        accent: '#1a1a2e',
        error: '#dc2626',
      },
    },
  },
  devtools: { enabled: false },
  devServer: {
    port: 3000,
  },
  vite: {
    css: {
      preprocessorOptions: {
        sass: {
          silenceDeprecations: ['import', 'global-builtin'],
        },
      },
    },
  },
})
