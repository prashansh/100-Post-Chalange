/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        creator: {
          green: '#22c55e',
          'green-dark': '#16a34a',
          'green-light': '#dcfce7',
          yellow: '#facc15',
          'yellow-dark': '#eab308',
          'yellow-light': '#fef9c3',
          card: '#f4ede4',
          'card-hover': '#ebe2d7',
          cream: '#faf7f2',
          dark: '#1c1917',
          accent: '#f97316'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
