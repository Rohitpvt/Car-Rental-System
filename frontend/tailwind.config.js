/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#7C3AED',
        accent: '#10B981',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        text_primary: '#0F172A',
        text_secondary: '#64748B',
        error: '#EF4444',
      },
      zIndex: {
        'base': '0',
        'header': '10',
        'sidebar': '20',
        'overlay': '30',
        'modal': '40',
        'toast': '50',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
