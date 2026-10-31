/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#05080B',
        card: '#0D131A',
        cardBorder: 'rgba(0, 255, 102, 0.15)',
        neon: {
          DEFAULT: '#00FF66',
          glow: 'rgba(0, 255, 102, 0.4)',
          dark: '#00CC52',
          muted: '#10B981',
        },
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0, 255, 102, 0.35)',
        'neon-sm': '0 0 10px rgba(0, 255, 102, 0.25)',
      },
    },
  },
  plugins: [],
};
