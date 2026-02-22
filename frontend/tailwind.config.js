/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
        },
        accent: '#4F46E5',
        'accent-hover': '#4338CA',
        'accent-light': '#818CF8',
        gold: '#EAB308',
        'gold-light': '#FEF9C3',
        success: '#16A34A',
        danger: '#DC2626',
        warning: '#D97706',
        surface: '#F8FAFC',
        'surface-alt': '#F1F5F9',
        navy: '#020617',
        'navy-dark': '#000000',
        charcoal: '#0F172A',
        steel: '#1E293B',
        slate: {
          750: '#293548',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body: ['Inter', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 20px 40px -12px rgb(0 0 0 / 0.08)',
        'elevated': '0 10px 30px -8px rgb(0 0 0 / 0.12)',
        'sidebar': '4px 0 30px -2px rgb(0 0 0 / 0.15)',
        'inner-glow': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.02)',
        'glow': '0 0 30px rgb(79 70 229 / 0.15)',
        'glow-lg': '0 0 50px rgb(79 70 229 / 0.2)',
        'button': '0 4px 14px 0 rgb(79 70 229 / 0.35)',
        'gold': '0 0 20px rgb(234 179 8 / 0.2)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'slide-in': 'slideIn 0.4s cubic-bezier(0.16,1,0.3,1)',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1)',
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.16,1,0.3,1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1)',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient': 'gradientShift 8s ease infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh': 'radial-gradient(at 40% 20%, rgb(79 70 229 / 0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, rgb(99 102 241 / 0.06) 0px, transparent 50%), radial-gradient(at 0% 50%, rgb(129 140 248 / 0.05) 0px, transparent 50%)',
        'mesh-dark': 'radial-gradient(at 40% 20%, rgb(79 70 229 / 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgb(99 102 241 / 0.1) 0px, transparent 50%), radial-gradient(at 0% 80%, rgb(67 56 202 / 0.1) 0px, transparent 50%)',
      },
    },
  },
  plugins: [],
};
