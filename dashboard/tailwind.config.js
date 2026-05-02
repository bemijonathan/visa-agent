/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Notion Design System
        notion: {
          purple: '#5645d4',
          'purple-pressed': '#4534b3',
          navy: '#0a1530',
          'navy-deep': '#070f24',
          'link-blue': '#0075de',
          orange: '#dd5b00',
          pink: '#ff64c8',
          teal: '#2a9d99',
          green: '#1aae39',
          yellow: '#f5d75e',
        },
        // Card tints (pastel backgrounds)
        tint: {
          peach: '#ffe8d4',
          rose: '#fde0ec',
          mint: '#d9f3e1',
          lavender: '#e6e0f5',
          sky: '#dcecfa',
          yellow: '#fef7d6',
          'yellow-bold': '#f9e79f',
          cream: '#f8f5e8',
          gray: '#f0eeec',
        },
        // Surface colors
        canvas: '#ffffff',
        surface: {
          DEFAULT: '#f6f5f4',
          soft: '#fafaf9',
        },
        // Border colors
        hairline: {
          DEFAULT: '#e5e3df',
          soft: '#ede9e4',
          strong: '#c8c4be',
        },
        // Text colors
        ink: {
          deep: '#000000',
          DEFAULT: '#1a1a1a',
        },
        charcoal: '#37352f',
        slate: '#5d5b54',
        steel: '#787671',
        stone: '#a4a097',
        muted: '#bbb8b1',
        // Semantic
        success: '#1aae39',
        warning: '#dd5b00',
        error: '#e03131',
        // Keep legacy primary for existing components
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
        },
      },
      fontFamily: {
        sans: [
          'DM Sans',
          '-apple-system',
          'system-ui',
          'sans-serif',
        ],
        display: [
          'Syne',
          'sans-serif',
        ],
      },
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        'xxl': '20px',
        'xxxl': '24px',
        'full': '9999px',
      },
      spacing: {
        'section-sm': '48px',
        'section': '64px',
        'section-lg': '96px',
        'hero': '120px',
      },
    },
  },
  plugins: [],
}
