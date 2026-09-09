/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0A0C10',
          raised: '#12151C',
          line: '#20242E',
        },
        marquee: {
          DEFAULT: '#E7B33E',
          dim: '#B8902F',
        },
        velvet: {
          DEFAULT: '#B23A2E',
          dim: '#8A2D24',
        },
        paper: '#EDEAE1',
        smoke: '#8A8F98',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};