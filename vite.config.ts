import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { FontaineTransform } from 'fontaine'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    FontaineTransform.vite({
      fallbacks: ['Segoe UI', 'Helvetica Neue', 'Roboto', 'system-ui'],
      resolvePath: id => id.startsWith('/') ? '.' + id : id,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url))
    },
  },
  cacheDir: '.vite',
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/vue')) {
            return 'vue'
          }
          if (id.includes('node_modules/vue-router')) {
            return 'vue-router'
          }
          if (id.includes('node_modules/pinia')) {
            return 'pinia'
          }
          if (id.includes('node_modules/vue-i18n')) {
            return 'vue-i18n'
          }
        }
      },
      onwarn(warning, warn) {
        if (warning.code === 'IMPORT_IS_UNDEFINED' && warning.message.includes('vue-i18n')) {
          return
        }
        warn(warning)
      }
    }
  }
})
