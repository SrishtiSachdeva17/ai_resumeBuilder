/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#dde6ff',
          500: '#4361ee',
          600: '#3451d1',
          700: '#2b42b8',
        },
        surface: '#0f1117',
        card: '#1a1d27',
        border: '#2a2d3e',
      },
    },
  },
  plugins: [],
};
