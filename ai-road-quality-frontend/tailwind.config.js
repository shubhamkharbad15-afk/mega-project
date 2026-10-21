/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        asphalt: {
          950: '#090d14',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
        hazard: {
          500: '#f59e0b',
          600: '#d97706',
          400: '#fbbf24',
        },
        telemetry: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        eco: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
