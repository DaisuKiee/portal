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
        // CTU Brand Colors - Matching Mobile App
        primary: {
          DEFAULT: '#0f75bc',
          dark: '#0a5a8f',
          light: '#3d9be0',
        },
        secondary: {
          DEFAULT: '#1a1a2e',
          light: '#16213e',
        },
        accent: '#e94560',
        dark: {
          DEFAULT: '#0f0f23',
          gray: '#2d2d44',
        },
        gray: {
          medium: '#6c6c80',
          light: '#e8e8ed',
          ultralight: '#f5f5f8',
        },
        success: '#27ae60',
        warning: '#f39c12',
        error: '#e74c3c',
        info: '#3498db',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
