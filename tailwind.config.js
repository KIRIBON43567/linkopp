/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2196F3',
          light: '#42A5F5',
          dark: '#1976D2',
        },
        secondary: {
          DEFAULT: '#9C27B0',
          light: '#BA68C8',
          dark: '#7B1FA2',
        },
        accent: {
          green: '#4CAF50',
          orange: '#FF9800',
        },
        background: {
          light: {
            primary: '#FFFFFF',
            secondary: '#F5F7FA',
            tertiary: '#E8EEF3',
          },
          dark: {
            primary: '#0A1929',
            secondary: '#1A2332',
            tertiary: '#2A3441',
          },
        },
        text: {
          light: {
            primary: '#1A1A1A',
            secondary: '#666666',
            tertiary: '#999999',
          },
          dark: {
            primary: '#FFFFFF',
            secondary: '#B0B8C1',
            tertiary: '#7A8290',
          },
        },
        status: {
          online: '#4CAF50',
          offline: '#9E9E9E',
          away: '#FFC107',
        },
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        'full': '9999px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
      fontSize: {
        'xs': ['10px', { lineHeight: '14px' }],
        'sm': ['12px', { lineHeight: '16px' }],
        'base': ['14px', { lineHeight: '20px' }],
        'md': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['28px', { lineHeight: '36px' }],
      },
      fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.07)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px rgba(0, 0, 0, 0.15)',
        'glow': '0 0 20px rgba(33, 150, 243, 0.4)',
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '250ms',
        'slow': '350ms',
      },
      zIndex: {
        'base': '0',
        'dropdown': '10',
        'sticky': '20',
        'fixed': '30',
        'modal-backdrop': '40',
        'modal': '50',
        'popover': '60',
        'tooltip': '70',
      },
    },
  },
  plugins: [],
}
