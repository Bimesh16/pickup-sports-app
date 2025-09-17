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
          blue: '#003893',       // Nepal's blue
          gold: '#F6C453',       // Nepal's gold accent
          white: '#FFFFFF',      // Nepal's white
        },
        // Surface tokens - WCAG AA compliant
        surface: {
          0: '#FFFFFF',          // Cards - highest contrast
          1: '#F8FAFC',          // Light background
          dark: '#0B1220',       // Hero/gradients - darkest
        },
        // Text tokens - High contrast ratios
        'text-strong': '#0B1021',      // ≥7:1 on surface-0/1
        'text-dark-contrast': '#F8FAFF', /* ≥8:1 on surface-dark */
        'text-muted': '#475569',       // Not < #64748B for accessibility
        // Border tokens
        border: {
          light: '#E5E7EB',      // Light borders
          dark: '#20304D',       // Dark borders
        },
        // Legacy compatibility
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