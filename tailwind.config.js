/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        court: {
          50: '#f4f7ef',
          100: '#e7efdc',
          200: '#cfdfbd',
          300: '#afc995',
          400: '#8dad68',
          500: '#6b8d49',
          600: '#536f38',
          700: '#40552e',
          800: '#36462a',
          900: '#2f3b27'
        },
        clay: '#d96b34',
        ink: '#192126',
        sand: '#f8f3e8'
      },
      boxShadow: {
        card: '0 20px 50px rgba(25, 33, 38, 0.08)'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif']
      }
    }
  },
  plugins: []
}
