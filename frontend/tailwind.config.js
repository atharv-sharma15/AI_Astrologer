/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FDFBF7',
          100: '#FAF7F2',
          200: '#F3EDE2',
          300: '#E7DEC9',
          400: '#D5C6AA',
        },
        vedic: {
          950: '#140320',
          900: '#210836',
          800: '#2F0D4C',
          700: '#3D1561',
          600: '#522080',
          500: '#6B2A9E',
        },
        gold: {
          300: '#F3E5AB',
          400: '#E5C158',
          500: '#D4AF37',
          600: '#C5A059',
          700: '#9B7825',
        },
        terracotta: {
          500: '#C2593F',
          600: '#A8442B',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'vedic': '0 4px 20px -2px rgba(47, 13, 76, 0.08), 0 2px 6px -1px rgba(212, 175, 55, 0.06)',
        'vedic-lg': '0 10px 25px -3px rgba(47, 13, 76, 0.12), 0 4px 10px -2px rgba(212, 175, 55, 0.1)',
      }
    },
  },
  plugins: [],
}
