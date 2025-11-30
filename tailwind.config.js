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
        'anode-dark': '#0f172a',    // Dark background (slate-900 equivalent)
        'anode-bg': '#1e293b',      // Slightly lighter background for cards (slate-800 equivalent)
        'anode-primary': '#0284c7', // A vibrant blue for primary actions (sky-600 equivalent)
        'anode-primary-light': '#38bdf8', // Lighter primary for text (sky-400 equivalent)
        'anode-secondary': '#16a34a', // A vibrant green for secondary actions (green-600 equivalent)
        'anode-accent': '#fcd34d',   // An accent yellow (amber-300 equivalent)
        'anode-text': '#cbd5e1',     // Light gray for general text (slate-300 equivalent)
        'anode-mint': '#7e22ce',     // Purple for mint (violet-700 equivalent)
        'anode-airdrop': '#be185d',  // Rose for airdrop (rose-700 equivalent)
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
      }
    },
  },
  plugins: [],
}
