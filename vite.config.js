// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  // CRITICAL NEW FIX FOR BUILD FAILURE
  build: {
    rollupOptions: {
      // Prevents bundling of packages that rely on Node globals or complex browser APIs
      external: [
        'buffer',
        'process'
      ]
    }
  }
})
