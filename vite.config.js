import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import rollupNodePolyfills from 'rollup-plugin-node-polyfills' 

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()], 
  resolve: {
    alias: {
      // 1. CRUCIAL FIX: CORRECTED PATH based on package.json ("lib/index.js")
      '@orbs-network/ton-access': '@orbs-network/ton-access/lib/index.js',
      // 2. Keep the buffer polyfill alias
      'buffer': 'buffer/' 
    }
  },
  define: {
    'global': 'globalThis', 
    'globalThis.Buffer': 'buffer',
  },
  optimizeDeps: {
    include: ['@orbs-network/ton-access'], // Ensure Vite pre-bundles this module
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        rollupNodePolyfills() 
      ]
    }
  }
})
