/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0d1117',
          surface: '#161b22',
          elevated: '#1c2128',
          overlay: '#21262d',
        },
        border: {
          DEFAULT: '#30363d',
          muted: '#21262d',
          emphasis: '#3d444d',
        },
        text: {
          primary: '#e6edf3',
          secondary: '#8b949e',
          muted: '#6e7681',
          link: '#58a6ff',
        },
        accent: {
          DEFAULT: '#58a6ff',
          hover: '#79b8ff',
          muted: '#388bfd26',
        },
        severity: {
          critical: '#ff4444',
          'critical-bg': '#3d1111',
          high: '#ff8800',
          'high-bg': '#2d1f00',
          medium: '#ffcc00',
          'medium-bg': '#2d2600',
          low: '#44ff88',
          'low-bg': '#0d2d1a',
          info: '#4499ff',
          'info-bg': '#0d1a2d',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['IBM Plex Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-in-out',
        'slide-in': 'slideIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
