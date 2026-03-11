import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: '#fdf2f4',
          100: '#fce7ea',
          200: '#f8d0d7',
          300: '#f2aab7',
          400: '#e97a90',
          500: '#db4d6d',
          600: '#c62e56',
          700: '#a72145',
          800: '#8b1e3e',
          900: '#6B0F1A',
          950: '#3d0710',
        },
        gold: {
          50: '#fbf8eb',
          100: '#f6eecc',
          200: '#eedd9c',
          300: '#e4c563',
          400: '#d4b96a',
          500: '#C9A84C',
          600: '#b08a30',
          700: '#8e6828',
          800: '#775427',
          900: '#664624',
        },
        ivory: {
          50: '#FFFDF9',
          100: '#FDF8F3',
          200: '#F5EDE4',
          300: '#E8DDD1',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
