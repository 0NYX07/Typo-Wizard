/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#323437',
        main: '#d1d0c5',
        sub: '#646669',
        subAlt: '#2c2e31',
        primary: '#61afef',
        error: '#ca4754',
        errorExtra: '#7e2a33'
      },
      fontFamily: {
        mono: ['Roboto Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
