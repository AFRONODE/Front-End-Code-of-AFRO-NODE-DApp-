// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    // Use the robust nodePolyfills plugin to handle Node globals
    nodePolyfills({
      include: ['buffer', 'process', 'util', 'stream'],
      globals: {
        Buffer: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  // The 'build' block has been removed to stop externalization and fix the module resolution error.
  define: {
    // Keeps process.env from crashing inside the bundled libraries
    'process.env': {}
  }
});
