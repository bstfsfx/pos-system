/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Wine red primary palette
        wine: {
          50: '#fdf4f4',
          100: '#fae8e8',
          200: '#f5d1d1',
          300: '#edaaaa',
          400: '#e27878',
          500: '#d94d4d',
          600: '#c43a3a',
          700: '#a32e2e',
          800: '#862a2a',
          900: '#6d2626',
          950: '#3d1212',
        },
        // Complementary warm tones
        cream: {
          50: '#fefdfa',
          100: '#fdf9f3',
          200: '#faf2e4',
          300: '#f5e6cd',
          400: '#edd6a8',
          500: '#e4c285',
          600: '#d9a85e',
          700: '#c48a43',
          800: '#a36f37',
          900: '#865932',
          950: '#472e1a',
        },
      },
    },
  },
  plugins: [],
}