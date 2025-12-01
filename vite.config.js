import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills' // <-- IMPORT THE CORRECT PACKAGE

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(), // <-- USE THE CORRECT PLUGIN HERE
  ],
  // Keep the specific fix for the external module
  build: {
    rollupOptions: {
      external: [
        '@orbs-network/ton-access'
      ]
    }
  }
})
