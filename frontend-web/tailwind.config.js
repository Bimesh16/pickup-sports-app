/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nepal Flag Colors + Brand Theme
        nepal: {
          crimson: '#DC143C',    // Nepal's crimson red
          white: '#FFFFFF',      // Nepal's white
          blue: '#003893',       // Nepal's blue
        },
        // Brand Theme: Navy → Royal → Crimson
        navy: '#1B263B',
        royal: '#003893',
        crimson: '#E63946',
        // Text tokens for WCAG AA compliance
        'text-dark': '#0E1116',
        'text-light': '#E9EEF5',
        'body-light': '#1F2937',
        'body-dark': '#E9EEF5',
        'helper-light': '#6B7280',
        'helper-dark': '#C7D1E0',
        emerald: {
          400: '#10b981',
          500: '#059669',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}