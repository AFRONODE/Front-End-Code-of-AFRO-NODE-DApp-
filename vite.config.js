// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills'; // Import the new plugin

export default defineConfig({
  // This ensures assets load correctly
  base: '/',
  plugins: [
    react(),
    // Use the plugin to fix Buffer, global, and the @ton/core parsing error
    nodePolyfills({
      // We explicitly include these to ensure they are processed/polyfilled 
      // even though they are dependencies, which resolves the SyntaxError.
      include: ['@ton/core', '@ton/ton'] 
    })
  ],
  
  // NOTE: The define, optimizeDeps, and build.commonjsOptions sections 
  // from the previous attempt are removed, as the plugin handles them.
});
