import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#F7F4EE',
          warm: '#F4EFE6',
          dark: '#EAE3D2',
          card: '#FAF8F5',
        },
        ink: {
          DEFAULT: '#1D1B18', // Deep Charcoal (16:1 contrast on paper)
          muted: '#36322D',   // Deepened espresso ink (~10:1 contrast, pristine AAA readability)
          faint: '#5C564E',   // Darkened secondary ink (~6:1 contrast, strictly WCAG AA compliant)
          border: '#CBC3B5',
        },
        koma: {
          purple: '#5A46D6',
          purpleDark: '#3F2EA6', // Extra deep rich indigo for text emphasis
          purpleLight: '#ECE9FE',
          purpleHover: '#332394',
          accent: '#FF5A36',
          kraft: '#DCCDBB',
        },
        sela: {
          purple: '#5A46D6',
          purpleDark: '#3F2EA6',
          purpleLight: '#ECE9FE',
          purpleHover: '#332394',
          accent: '#FF5A36',
          kraft: '#DCCDBB',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'paper-sm': '0 1px 3px rgba(29, 27, 24, 0.08), 0 1px 2px rgba(29, 27, 24, 0.04)',
        'paper': '2px 4px 12px rgba(29, 27, 24, 0.08), 0 1px 3px rgba(29, 27, 24, 0.04)',
        'paper-lift': '4px 8px 24px rgba(29, 27, 24, 0.12), 0 2px 6px rgba(29, 27, 24, 0.06)',
        'paper-float': '6px 12px 32px rgba(29, 27, 24, 0.16), 0 4px 8px rgba(29, 27, 24, 0.08)',
        'ink-border': 'inset 0 0 0 1px rgba(29, 27, 24, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
