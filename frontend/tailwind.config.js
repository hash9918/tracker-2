/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: '#0a0c10',
        darkCard: '#161b24',
        darkBorder: '#1e2530',
        accentGreen: '#00e5a0',
        darkText: '#e2e8f0',
        darkMuted: '#64748b',
        errorRed: '#ff6b35',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
