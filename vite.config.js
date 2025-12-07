// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // <--- CRUCIAL: Make sure this line is here
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(), // <--- This function call requires the import above
    nodePolyfills({
      include: ['buffer', 'process', 'util', 'stream'],
      globals: {
        Buffer: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  base: '/Front-End-Code-of-AFRO-NODE-DApp-/', // Added for GitHub Pages
  define: {
    'process.env': {}
  }
});
