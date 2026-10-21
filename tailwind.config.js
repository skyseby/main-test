/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#08080d',
        panel: '#12121a',
        blue: '#007aff',
        cyan: '#22d3ee',
        mint: '#6ee7b7',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(0, 122, 255, .18)',
      },
    },
  },
  plugins: [],
};