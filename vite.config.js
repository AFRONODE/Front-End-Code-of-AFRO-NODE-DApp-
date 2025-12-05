// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    // Use the robust nodePolyfills plugin
    nodePolyfills({
      include: ['buffer', 'process', 'util', 'stream'],
      globals: {
        Buffer: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  build: {
    rollupOptions: {
      // EXTERNALIZE CRITICAL LIBRARIES
      external: ['@ton/ton', '@orbs-network/ton-access'],
      output: {
        // Essential to prevent internal Node modules from being incorrectly bundled
        globals: {
          '@ton/ton': 'Ton',
          '@orbs-network/ton-access': 'TonAccess',
        },
      },
    },
  },
  define: {
    'process.env': {}
  }
});
