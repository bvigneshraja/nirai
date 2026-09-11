/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        apple: {
          blue:    '#007AFF',
          indigo:  '#5856D6',
          purple:  '#AF52DE',
          pink:    '#FF2D55',
          red:     '#FF3B30',
          orange:  '#FF9500',
          yellow:  '#FFCC00',
          green:   '#34C759',
          teal:    '#5AC8FA',
          gray:    '#8E8E93',
          // system backgrounds
          bg:      '#F2F2F7',
          bg2:     '#EFEFF4',
          card:    '#FFFFFF',
          // labels
          label:   '#1C1C1E',
          label2:  '#3C3C43',
          label3:  '#8E8E93',
          sep:     'rgba(60,60,67,0.12)',
        },
      },
      borderRadius: {
        apple: '10px',
        'apple-lg': '14px',
        'apple-xl': '18px',
      },
      boxShadow: {
        apple:    '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)',
        'apple-sm': '0 1px 2px rgba(0,0,0,0.06)',
        'apple-md': '0 4px 20px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
};
