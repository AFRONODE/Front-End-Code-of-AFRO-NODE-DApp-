// vite.config.js - COMPLETE AND FINAL CLEANUP

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'process', 'util', 'stream'],
      globals: {
        Buffer: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  base: '/',
  define: {
    'process.env': {}
  }
});
