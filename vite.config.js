// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills' // <-- IMPORT THIS

export default defineConfig({
  plugins: [
    react(),
    // <-- ADD THIS PLUGIN CALL
    nodePolyfills({
      // We explicitly include 'buffer' and 'process'
      include: ['buffer', 'process'], 
      globals: {
        global: true, 
        process: true,
      },
    }),
  ],
  // This is often needed when using polyfills
  define: {
    'global': 'window', 
  },
})
