/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: '#050505',
        'surface-elevated': '#0c0c0c',
        'surface-border': '#1c1c1c',
        primary: {
          50: '#f4f4f5',
          100: '#e4e4e7',
          400: '#ffffff',
          500: '#f4f4f5',
          600: '#27272a',
          700: '#18181b',
        },
        agent: {
          technical: '#ffffff',
          hr: '#ffffff',
          hiring: '#ffffff',
          skeptic: '#ffffff',
          synthesizer: '#ffffff'
        },
        verdict: {
          strong_hire: '#ffffff',
          hire: '#e4e4e7',
          interview: '#d4d4d8',
          hold: '#a1a1aa',
          reject: '#71717a'
        }
      },
      fontFamily: {
        sans: ['Archivo', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Abril Fatface', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
