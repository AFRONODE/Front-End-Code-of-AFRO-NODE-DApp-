// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  // --- FINAL FIX: ROBUST CONTENT SCANNER ---
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // Ensure all common extensions are listed explicitly
  ],
  // ----------------------------------------
  theme: {
    // ... (rest of the file remains the same)
