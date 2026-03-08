/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#020817',
          secondary: '#0f172a'
        },
        primary: {
          DEFAULT: '#22d3ee',
          foreground: '#020817',
        },
        secondary: {
          DEFAULT: '#1e293b',
          foreground: '#f8fafc'
        },
        accent: {
          DEFAULT: '#0ea5e9',
          foreground: '#f8fafc'
        },
        text: {
          primary: '#f8fafc',
          muted: '#94a3b8'
        },
        border: {
          subtle: 'rgba(148, 163, 184, 0.1)',
          active: 'rgba(34, 211, 238, 0.3)',
          DEFAULT: 'rgba(148, 163, 184, 0.1)'
        },
        slate: {
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
        }
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        heading: ['Manrope', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 15px rgba(34,211,238,0.15)',
        'glow-lg': '0 0 20px rgba(34,211,238,0.4)',
      },
      backdropBlur: {
        'xl': '24px',
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}