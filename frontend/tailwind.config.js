/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#eef8ff', 100: '#d9f0ff', 500: '#0d7ca8', 600: '#08658c', 700: '#074f70', 800: '#053c55' },
      },
    },
  },
  plugins: [],
}
