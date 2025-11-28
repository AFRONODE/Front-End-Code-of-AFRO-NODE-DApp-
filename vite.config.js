import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // This ensures assets load correctly
  base: '/',
  plugins: [react()],
  // FIX: Polyfill Buffer for TON wallet libraries
  define: {
    // Note: 'global' is needed by many crypto libraries that run in Node.js
    global: 'globalThis',
    // Polyfill the missing Buffer object using the 'buffer' package
    'Buffer': ['buffer', 'Buffer'],
    // Process env is also often needed
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
});
