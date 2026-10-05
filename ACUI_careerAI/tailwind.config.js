/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'sans-serif'],
        display: ['Inter', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        display: ['var(--type-display)', { lineHeight: 'var(--leading-display)', fontWeight: '700' }],
        h1: ['var(--type-h1)', { lineHeight: 'var(--leading-heading)', fontWeight: '700' }],
        h2: ['var(--type-h2)', { lineHeight: 'var(--leading-heading)', fontWeight: '600' }],
        h3: ['var(--type-h3)', { lineHeight: 'var(--leading-heading)', fontWeight: '600' }],
        'card-title': ['var(--type-card-title)', { lineHeight: 'var(--leading-heading)', fontWeight: '600' }],
        body: ['var(--type-body)', { lineHeight: 'var(--leading-body)' }],
        small: ['var(--type-small)', { lineHeight: 'var(--leading-body)' }],
        label: ['var(--type-label)', { lineHeight: 'var(--leading-label)', fontWeight: '600' }],
        caption: ['var(--type-caption)', { lineHeight: 'var(--leading-label)' }],
      },
      colors: {
        navy: {
          900: 'var(--app-page)',
          800: 'var(--app-surface)',
          700: 'var(--app-surface-muted)',
          600: 'var(--app-border-strong)',
        },
        brand: {
          50: 'var(--app-brand-soft)',
          100: 'var(--app-brand-tint)',
          600: 'var(--app-brand)',
          700: 'var(--app-brand-hover)',
        }
      }
    },
  },
  plugins: [],
}
