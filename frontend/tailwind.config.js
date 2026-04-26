/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        surface: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
          400: '#94A3B8',
          100: '#F1F5F9',
        },
        brand: '#3B82F6',
        status: {
          ruta: '#22C55E',
          cola: '#F59E0B',
          finalizado: '#64748B',
          fuera: '#EF4444',
          mantenimiento: '#A855F7',
          disponible: '#38BDF8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
