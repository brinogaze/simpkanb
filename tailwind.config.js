/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#06070d',
          surface: '#0b1020',
          elevated: '#11182d',
          overlay: '#18233f',
        },
        border: {
          DEFAULT: '#243457',
          muted: '#18233d',
          emphasis: '#3a4f7f',
        },
        text: {
          primary: '#f4f7ff',
          secondary: '#a8b4d6',
          muted: '#7d89ad',
          link: '#6fd9ff',
        },
        accent: {
          DEFAULT: '#00d9ff',
          hover: '#61e7ff',
          muted: '#00d9ff26',
        },
        severity: {
          critical: '#ff4d6d',
          'critical-bg': '#3c1120',
          high: '#a56bff',
          'high-bg': '#25153f',
          medium: '#23d5ff',
          'medium-bg': '#09263c',
          low: '#37f0b5',
          'low-bg': '#0c2f26',
          info: '#6fb8ff',
          'info-bg': '#122749',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Space Grotesk', 'Montserrat', 'system-ui', 'sans-serif'],
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
