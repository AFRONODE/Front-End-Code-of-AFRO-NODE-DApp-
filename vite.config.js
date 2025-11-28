import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // This ensures assets (like your main JS bundle) are referenced 
  // correctly from the root of your Netlify URL (https://afron-node.netlify.app/)
  base: '/', 
  plugins: [react()],
});
