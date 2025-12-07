// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // <--- CRITICAL: React plugin import
import { nodePolyfills } from 'vite-plugin-node-polyfills'; // <--- Polyfills import

export default defineConfig({
  plugins: [
    react(), // <--- React plugin
    nodePolyfills({
      include: ['buffer', 'process', 'util', 'stream'],
      globals: {
        Buffer: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  // FIX: Changing base path to '/' for Netlify/root deployment
  base: '/', 
  define: {
    'process.env': {}
  }
});
