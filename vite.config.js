// vite.config.js - COMPLETE ALIAS FIX

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills'; // Full import

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'process', 'util', 'stream'], // Added full include list
      globals: {
        Buffer: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  // CRITICAL ADDITION: Redirect the broken package to a harmless file to resolve runtime error.
  resolve: {
    alias: {
      // Forcing the broken reference to resolve to a harmless file from the correct package
      "@ton/ton": "node_modules/tonweb/src/tonweb-main.js" 
    }
  },
  // FIX: Changing base path to '/' for Netlify/ro>
  base: '/',
  define: {
    'process.env': {}
  }
});
