/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        carbon:  '#111110',
        ink:     '#1c1b19',
        ash:     '#6b6860',
        stone:   '#a09890',
        cream:   '#e8e4dc',
        paper:   '#f2efe8',
        pearl:   '#faf8f4',
        gold:    '#b89a5a',
        'gold-lt': '#d4b87a',
        marble:  '#ddd9d0',
      },
      fontFamily: {
        serif:  ['Cormorant Garamond', 'Georgia', 'serif'],
        mono:   ['DM Mono', 'monospace'],
        sans:   ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
