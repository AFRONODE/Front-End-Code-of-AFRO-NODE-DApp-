// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills' 

export default defineConfig({
  // Add the base path for Netlify (Highly Recommended)
  base: './', 
  plugins: [
    react(),
    nodePolyfills({
      // We explicitly include 'buffer' and 'process'
      include: ['buffer', 'process'],
      globals: {
        global: true,
        process: true,
      },
    }),
  ],
  // *** CRITICAL CHANGE: Use 'globalThis' for reliable global scope mapping ***
  define: {
    'global': 'globalThis',
    // Always good to define the environment mode explicitly too:
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
})
