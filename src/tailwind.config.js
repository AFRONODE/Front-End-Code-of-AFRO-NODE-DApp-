/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'media', 
  theme: {
    extend: {
      colors: {
        'anode-primary': '#00ADB5',
        'anode-dark': '#222831',
        'anode-bg': '#393E46',
      }
    },
  },
  plugins: [],
}
