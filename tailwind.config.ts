import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#fbf8fd',
        primary: '#000f3f',
        'primary-container': '#172554',
        secondary: '#505f76',
        'secondary-container': '#d0e1fb',
        surface: '#ffffff',
        'surface-container-low': '#f5f3f7',
        'surface-container': '#efedf2',
        'surface-container-high': '#eae7ec',
        'surface-container-highest': '#e4e1e6',
        'surface-container-lowest': '#ffffff',
        'on-surface': '#1b1b1f',
        'on-surface-variant': '#45464f',
        'outline-variant': '#c6c5d0',
        'on-secondary-container': '#54647a',
        'on-primary-container': '#808dc2',
        'on-primary': '#ffffff',
        error: '#ba1a1a',
        'on-tertiary-fixed': '#301400',
        'tertiary-fixed': '#ffdcc5',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
      }
    },
  },
  plugins: [],
};
export default config;
