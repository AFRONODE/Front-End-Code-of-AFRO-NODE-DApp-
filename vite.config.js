// vite.config.js
import { defineConfig } from 'vite';
// ... (imports)

export default defineConfig({
  plugins: [
    react(),
    // ... (nodePolyfills plugin)
  ],
  base: '/Front-End-Code-of-AFRO-NODE-DApp-/', // <--- ADD THIS LINE HERE
  // The 'build' block has been removed to stop ex>
  define: {
    // Keeps process.env from crashing inside the >
    'process.env': {}
  }
});
