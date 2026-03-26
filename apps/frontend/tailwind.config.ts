import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0061FF',
          50: '#E6F0FF',
          100: '#CCE0FF',
          500: '#0061FF',
          600: '#0055E0',
          700: '#0047BD',
        },
        success: '#16C784',
        danger: '#FF4D4F',
        background: '#F7F9FC',
        surface: '#FFFFFF',
        border: '#E8ECF0',
        muted: '#8A94A6',
        accent: '#111111',
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

export default config
