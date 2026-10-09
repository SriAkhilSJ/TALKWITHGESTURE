/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        counter: {
          bg: '#0B1220',
          panel: '#121A2B',
          panel2: '#182236',
          line: '#2A3A58',
          gold: '#F5C518',
          gold2: '#FFD65A',
          text: '#F8FAFC',
          mute: '#94A3B8',
          ok: '#34D399',
          warn: '#FBBF24',
          bad: '#F87171',
        },
      },
      fontFamily: {
        sans: [
          'Segoe UI',
          'Noto Sans',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
