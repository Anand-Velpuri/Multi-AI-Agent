/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Zinc-based dark palette (much richer than pure black)
        bg: {
          base:    '#09090b',  // zinc-950
          surface: '#18181b',  // zinc-900
          raised:  '#27272a',  // zinc-800
          overlay: '#3f3f46',  // zinc-700
        },
        border: {
          subtle:  '#1c1c1e',
          DEFAULT: '#27272a',
          strong:  '#3f3f46',
        },
        text: {
          primary:     '#fafafa',   // zinc-50
          secondary:   '#d4d4d8',   // zinc-300
          muted:       '#a1a1aa',   // zinc-400
          placeholder: '#52525b',   // zinc-600
        },
        accent: {
          DEFAULT: '#e4e4e7',
          muted:   '#a1a1aa',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.04em' }],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in':   'fadeIn 0.2s ease-out',
        'slide-up':  'slideUp 0.3s cubic-bezier(0.25,0.46,0.45,0.94)',
        'fade-up':   'fadeUp 0.35s cubic-bezier(0.25,0.46,0.45,0.94)',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeUp:  { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
      typography: ({ theme }) => ({
        invert: {
          css: {
            '--tw-prose-body':          theme('colors.text.secondary'),
            '--tw-prose-headings':      theme('colors.text.primary'),
            '--tw-prose-lead':          theme('colors.text.secondary'),
            '--tw-prose-links':         theme('colors.text.muted'),
            '--tw-prose-bold':          theme('colors.text.primary'),
            '--tw-prose-counters':      theme('colors.text.muted'),
            '--tw-prose-bullets':       theme('colors.border.strong'),
            '--tw-prose-hr':            theme('colors.border.subtle'),
            '--tw-prose-quotes':        theme('colors.text.secondary'),
            '--tw-prose-quote-borders': theme('colors.border.strong'),
            '--tw-prose-captions':      theme('colors.text.muted'),
            '--tw-prose-code':          theme('colors.text.primary'),
            '--tw-prose-pre-code':      theme('colors.text.secondary'),
            '--tw-prose-pre-bg':        theme('colors.bg.surface'),
            '--tw-prose-th-borders':    theme('colors.border.DEFAULT'),
            '--tw-prose-td-borders':    theme('colors.border.subtle'),
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
