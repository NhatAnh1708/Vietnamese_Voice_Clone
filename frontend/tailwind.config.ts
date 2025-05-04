import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class', // Enable dark mode based on class
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: "#3B82F6",
        },
      },
    },
  },
  plugins: [],
};

export default config;