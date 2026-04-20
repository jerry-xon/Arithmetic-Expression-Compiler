/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        '12': '12px',
        '16': '16px',
      },
      colors: {
        bg: {
          primary: '#030812',
          secondary: '#0f1220',
          tertiary: '#1a1f35',
          card: '#252e4a',
        },
        accent: {
          purple: '#8b5cf6',
          teal: '#06b6d4',
          orange: '#f97316',
          yellow: '#fbbf24',
          red: '#ef4444',
          blue: '#3b82f6',
          green: '#10b981',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-up': 'slideUp 0.3s ease forwards',
        'pop-in': 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        popIn: { from: { opacity: 0, transform: 'scale(0.7)' }, to: { opacity: 1, transform: 'scale(1)' } },
        glowPulse: { '0%,100%': { boxShadow: '0 0 8px rgba(139, 92, 246, 0.4)' }, '50%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.8)' } },
      },
    },
  },
  plugins: [],
};
