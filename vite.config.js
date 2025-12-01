import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: { // <-- Keep this block, but remove the 'postcss' line
    // postcss: './postcss.config.cjs', // <-- REMOVE THIS LINE
  },
})
