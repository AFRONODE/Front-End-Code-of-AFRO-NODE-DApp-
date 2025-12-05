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
  resolve: {
    // 1. Alias 'whatwg-fetch' to the global 'fetch' to resolve the 'Request' constructor issue
    // This tells the bundler to use the standard browser implementation
    alias: {
      'whatwg-fetch': 'unfetch', // or just use a dummy alias to prevent bundling it again
    },
  },
  build: {
    rollupOptions: {
      // 2. EXTERNALIZE CRITICAL LIBRARIES
      // This tells Rollup (Vite's bundler) to stop trying to process these imports,
      // which often resolves the deep-seated destructuring errors.
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
