/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'panel-bg': '#1D1D1D',
        'panel-header': '#2D2D2D',
        'app-bg': '#121212',
        'accent-blue': '#1473E6',
      }
    },
  },
  plugins: [],
}
