import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['var(--font-geist)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-geist)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-geist-mono)', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#0F766E',
          hover:   '#0D9488',
          light:   '#F0FDFA',
          50:  '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        accent: {
          DEFAULT: '#0EA5E9',
          50:  '#F0F9FF',
          100: '#E0F2FE',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
        },
        surface:    'var(--color-surface)',
        background: 'var(--color-background)',
        muted:      'var(--color-text-muted)',
        border: {
          DEFAULT: 'var(--color-border)',
          strong:  'var(--color-border-strong)',
        },
        success: {
          DEFAULT: '#16A34A',
          light:   '#F0FDF4',
          text:    '#15803D',
        },
        warning: {
          DEFAULT: '#EA580C',
          light:   '#FFF7ED',
          text:    '#C2410C',
        },
        danger: {
          DEFAULT: '#DC2626',
          light:   '#FEF2F2',
          text:    '#B91C1C',
        },
        info: {
          DEFAULT: '#0EA5E9',
          light:   '#F0F9FF',
          text:    '#0369A1',
        },
      },
      borderRadius: {
        card:   '1rem',
        button: '0.625rem',
      },
      boxShadow: {
        card:         '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 6px -2px rgb(0 0 0 / 0.05)',
        'card-lg':    '0 8px 24px 0 rgb(0 0 0 / 0.08), 0 4px 10px -2px rgb(0 0 0 / 0.06)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          from: { transform: 'translateX(-100%)' },
          to:   { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in':       'fade-in 0.2s ease-out',
        'slide-in-left': 'slide-in-left 0.25s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
