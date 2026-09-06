/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // never toggled on; guarantees no accidental dark mode via prefers-color-scheme
  theme: {
    extend: {
      colors: {
        bg: '#F5F6F7',
        panel: '#FFFFFF',
        border: '#DADDE1',
        text: {
          primary: '#171717',
          secondary: '#5F6368'
        },
        primary: {
          DEFAULT: '#1558A6',
          dark: '#0F4685'
        },
        critical: '#B42318',
        warning: '#B54708',
        success: '#287D3C',
        infobg: '#EAF2FB'
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'Helvetica', 'sans-serif']
      },
      borderRadius: {
        none: '0px',
        DEFAULT: '2px',
        md: '2px',
        lg: '4px',
        xl: '4px',
        '2xl': '4px',
        full: '4px'
      },
      fontSize: {
        xs: '12px',
        sm: '13px',
        base: '14px',
        md: '16px',
        lg: '18px',
        xl: '22px',
        '2xl': '24px'
      }
    }
  },
  plugins: []
}
