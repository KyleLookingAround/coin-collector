/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0f1419',
          card: '#161d27',
          elevated: '#1c2532',
          border: '#2a3547',
        },
        accent: {
          teal: '#00d4aa',
          amber: '#f5a623',
          coral: '#ff6b6b',
          violet: '#b78bfa',
          blue: '#4a9eff',
        },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
    },
  },
  plugins: [],
};
