import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

/**
 * @dev Vite configuration for AFRO-NODE DApp
 * @notice Implements Node.js polyfills for TON SDK compatibility
 */
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
    // Shimming process.env for browser-side libraries
    'process.env': {}
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  }
});
