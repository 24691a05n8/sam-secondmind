/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sam: {
          bg: '#080A12',
          surface: '#101426',
          card: '#151A2E',
          cardHover: '#1B223C',
          border: 'rgba(139, 92, 246, 0.2)',
          purple: '#8B5CF6',
          blue: '#4F8CFF',
          highlight: '#B69CFF',
          text: '#F8FAFC',
          muted: '#94A3B8',
          accent: '#A855F7',
          cyan: '#38BDF8',
          emerald: '#10B981',
          rose: '#F43F5E',
          amber: '#F59E0B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'glow-purple': '0 0 25px -5px rgba(139, 92, 246, 0.35)',
        'glow-blue': '0 0 25px -5px rgba(79, 140, 255, 0.35)',
        'glow-cyan': '0 0 25px -5px rgba(56, 189, 248, 0.35)',
        'glow-lg': '0 0 50px -10px rgba(139, 92, 246, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(79, 140, 255, 0.6)' }
        }
      }
    },
  },
  plugins: [],
}

