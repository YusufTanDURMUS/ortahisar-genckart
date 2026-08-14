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
        brand: {
          50: '#f0fdfa', // teal-50
          100: '#ccfbf1',
          500: '#14b8a6', // teal-500
          600: '#0d9488', // teal-600 (Main)
          700: '#0f766e',
          900: '#134e4a',
        },
        ortahisar: {
          blue: {
            light: '#38bdf8',
            DEFAULT: '#0ea5e9',
            dark: '#0369a1',
          },
          green: {
            light: '#4ade80',
            DEFAULT: '#22c55e',
            dark: '#16a34a',
          },
          accent: '#f59e0b',
          light: '#f8fafc',
          dark: '#0f172a'
        }
      },
    },
  },
  plugins: [],
}
