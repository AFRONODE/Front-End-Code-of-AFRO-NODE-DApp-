import { defineConfig } from 'vite' // Corrected: defineConfig (capital C)
import react from '@vitejs/plugin-react' // Corrected: @vitejs/plugin-react

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.cjs', // Removed trailing > and confirmed path
  },
})
