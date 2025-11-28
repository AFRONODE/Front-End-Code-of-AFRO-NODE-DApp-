// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Fix 1: The Buffer polyfill (from the previous white screen error)
  define: {
    global: 'globalThis',
    'Buffer': ['buffer', 'Buffer'],
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },

  // This ensures assets load correctly
  base: '/',
  plugins: [react()],
  
  // FIX 2: Rollup/CommonJS Parser Error for @ton/core
  optimizeDeps: { 
    // Pre-bundle these packages for development mode
    include: ['@ton/core', '@ton/ton'] 
  },
  build: {
    target: 'es2020', // Ensure a modern build target
    commonjsOptions: {
      // Force conversion of problematic modules
      transformMixedEsModules: true,
      // Explicitly include the @ton packages so they are processed/transpiled
      include: [/node_modules\/@ton\/.*/, /node_modules/]
    }
  }
});

