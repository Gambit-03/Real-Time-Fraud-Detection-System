/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        banking: {
          navy: '#1a2332',
          'navy-dark': '#0f1419',
          'navy-light': '#2a3441',
          'navy-lighter': '#3a4554',
          blue: '#0066cc',
          'blue-dark': '#0052a3',
          'blue-light': '#3385d6',
          gold: '#d4af37',
          'gold-light': '#e5c866',
          silver: '#c0c0c0',
          success: '#00a86b',
          warning: '#ff9800',
          danger: '#dc3545',
          'danger-dark': '#b02a37',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'banking': '0 2px 8px rgba(0, 0, 0, 0.15)',
        'banking-lg': '0 4px 16px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}

