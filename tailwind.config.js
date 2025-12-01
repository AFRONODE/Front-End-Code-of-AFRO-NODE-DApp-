// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ... your custom colors ...
      },
      fontFamily: {
        // ... your font family ...
      }
    },
  },
  plugins: [],
  // Ensure there is NO 'postcss' block here
}
