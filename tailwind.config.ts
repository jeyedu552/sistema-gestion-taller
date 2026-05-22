import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#fbf8fd",
        primary: "#000f3f",
        "primary-container": "#172554",
        secondary: "#505f76",
        surface: "#ffffff",
        "surface-container": "#efedf2",
        error: "#ba1a1a",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
      }
    },
  },
  plugins: [],
};
export default config;