import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-yellow': '#FFE5B4',
        'primary-blue': '#6B8DD6',
        'primary-green': '#90B77D',
        'primary-pink': '#FFB6C1',
        'primary-purple': '#DDA0DD',
        'background-cream': '#FFFEF5',
        'background-paper': '#FFF8DC',
        'text-dark': '#2D3748',
        'text-medium': '#718096',
        'text-light': '#A0AEC0',
        'functional-success': '#68D391',
        'functional-error': '#FC8181',
        'functional-warning': '#F6E05E',
      },
      fontFamily: {
        hand: ['Caveat', 'Patrick Hand', 'Indie Flower', 'cursive'],
        handwritten: ['Caveat', 'Patrick Hand', 'cursive'],
      },
      backgroundImage: {
        'notebook-lines': 'repeating-linear-gradient(transparent, transparent 27px, #E8E8E8 28px)',
        'paper-texture': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E\")",
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'wobble': 'wobble 0.5s ease-in-out',
        'sketch-in': 'sketchIn 0.6s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        wobble: {
          '0%, 100%': { transform: 'rotate(-1deg)' },
          '50%': { transform: 'rotate(1deg)' },
        },
        sketchIn: {
          '0%': { opacity: '0', transform: 'scale(0.8) rotate(-3deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
