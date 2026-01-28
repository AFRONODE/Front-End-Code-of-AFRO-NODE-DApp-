import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        process: true,
      },
    }),
  ],
  resolve: {
    alias: {
      util: 'util',
    },
  },
  optimizeDeps: {
    include: ['@ton/core', '@ton/ton'],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: [], 
    }
  },
})
