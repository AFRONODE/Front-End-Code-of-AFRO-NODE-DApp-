import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: { // <-- ADD THIS CSS BLOCK
    postcss: './postcss.config.cjs', // <-- Explicitly point to your PostCSS config file
  },
})
