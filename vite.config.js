// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // CRITICAL FIX: Explicitly configure PostCSS for Tailwind to run in the build
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
})
