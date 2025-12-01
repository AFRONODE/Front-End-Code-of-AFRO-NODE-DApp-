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
        'anode-dark': '#0f172a', // <-- THIS LINE IS CRUCIAL
        'anode-bg': '#1e293b',
        'anode-primary': '#0284c7',
        'anode-primary-light': '#38bdf8',
        'anode-secondary': '#16a34a',
        'anode-accent': '#fcd34d',
        'anode-text': '#cbd5e1',
        'anode-mint': '#7e22ce',
        'anode-airdrop': '#be185d',
      },
      fontFamily: { // Corrected: fontFamily (capital F in the comment, but code should be lowercase)
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
      }
    },
  },
  plugins: [],
}
