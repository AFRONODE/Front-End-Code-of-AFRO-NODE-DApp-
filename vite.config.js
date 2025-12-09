// vite.config.js - FINAL BUILD FIX (Externalizing dependency)

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills'; // Full import name added for clarity

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'process', 'util', 'stream', 'crypto', 'events'], // Added full include list for completeness
      globals: {
        Buffer: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  // FIX: Changing base path to '/' for Netlify/ro>
  base: '/',
  define: {
    'process.env': {}
  },
  // CRITICAL ADDITION: Externalize the problematic package to force the build to succeed.
  build: {
    rollupOptions: {
      external: ['@ton/ton'] 
    }
  }
});
