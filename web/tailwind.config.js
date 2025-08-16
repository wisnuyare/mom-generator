/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brown: {
          50: '#FAF7F2',
          100: '#F8F4EE',
          200: '#F5E6D3',
          300: '#E6D2B5',
          400: '#D2B48C',
          500: '#A0896B',
          600: '#8B7355',
          700: '#6B5B47',
          800: '#4A3F35',
          900: '#2D2520',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}