import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // euinturkiye marka renkleri (ana sayfadaki CSS değişkenlerinden)
        eu: {
          DEFAULT: "#003399",
          deep: "#001F4D",
          pale: "#E8EEF7",
        },
        tr: "#E30613",
        ink: "#0A0E27",
        slate: "#5A6B7D",
        mist: "#8A98A8",
        line: "#E5EAF0",
        card: "#FFFFFF",
      },
      fontFamily: {
        sans: ["Archivo", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
