import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// NOTE: Ensure 'rollup-plugin-node-polyfills' is installed: 
// npm install rollup-plugin-node-polyfills buffer process

export default defineConfig({
  plugins: [react()],
  
  // CRITICAL POLYFILLS FOR TON LIBRARIES
  resolve: {
    alias: {
      // 1. Core Node modules needed by crypto/util libraries
      'stream': 'rollup-plugin-node-polyfills/polyfills/stream',
      'util': 'rollup-plugin-node-polyfills/polyfills/util',
      'assert': 'rollup-plugin-node-polyfills/polyfills/assert',
      'path': 'rollup-plugin-node-polyfills/polyfills/path',
      
      // 2. Safely map Buffer using the ES6 version
      'buffer': 'rollup-plugin-node-polyfills/polyfills/buffer-es6', 
      
      // 3. Keep the custom TON SDK alias
      '@orbs-network/ton-access': '@orbs-network/ton-access',
    }
  },
  
  // Ensure 'global' and 'Buffer' are correctly defined in the browser scope
  define: {
    'global': 'globalThis',
    // Explicit definition for Buffer to ensure global access for dependencies
    'globalThis.Buffer': 'Buffer',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  
  // Optimization to ensure polyfills are processed first
  optimizeDeps: {
    include: ['buffer', 'process', 'assert', 'util', 'stream'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  
  // The old build plugin section is removed as the alias method is sufficient and cleaner.
  build: {
    rollupOptions: {
      plugins: [
        // Relying on aliases defined above
      ]
    }
  }
});
