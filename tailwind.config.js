/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0f172a', // Navy Slate
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#475569', // Slate Medium
          foreground: '#ffffff',
        },
        border: '#cbd5e1',
        input: '#cbd5e1',
        ring: '#0f172a',
        background: '#f8fafc',
        foreground: '#1e293b',
        muted: {
          DEFAULT: '#f1f5f9',
          foreground: '#64748b',
        },
        accent: {
          DEFAULT: '#f1f5f9',
          foreground: '#1e293b',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#1e293b',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#1e293b',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
