// Tailwind CSS configuration file
// Set BYU colors and font

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        byuNavy: '#002E5D',
        byuRoyal: '#0047BA',
        byuDarkGray: '#141414',
        byuMediumGray: '#666666',
        byuWhite: '#FFFFFF',
        byuRedBright: '#E61744',
        byuRedDark: '#A3082A',
        byuYellowBright: '#FFB700',
        byuBrown: '#8C3A00',
        byuGreenBright: '#10A170',
        byuGreenDark: '#006141',
        byuInfoBlueBright: '#1FB3D1',
        byuInfoBlueDark: '#006073',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      keyframes: {
        'fade-in-out': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '10%': { opacity: '1', transform: 'translateY(0)' },
          '90%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'fade-in-out': 'fade-in-out 3s ease-in-out forwards',
      },
    },
  },
  plugins: [],
};
