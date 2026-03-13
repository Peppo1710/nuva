/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#1A2744",
        "primary-dark": "#3A51A0",
        teal: "#1D9E75",
        "teal-dark": "#3DD6A3",
        violet: "#534AB7",
        "violet-dark": "#8B83E0",
        surface: "#FFFFFF",
        "surface-dark": "#1C2540",
        navy: "#0D1321",
        "navy-dark": "#F0F4FF",
        background: "#F7F8FA",
        "background-dark": "#0D1321",
        error: "#E24B4A",
        "error-dark": "#F09595",
        success: "#1D9E75",
        "success-dark": "#3DD6A3",
        warning: "#BA7517",
        "warning-dark": "#EF9F27",
        muted: "#A0AABA",
        "muted-dark": "#4A5568",
        "app-border": "#E8ECF2",
        "app-border-dark": "#263050",
      },
      fontSize: {
        "body": ["17px", { lineHeight: "24px" }],
        "body-lg": ["20px", { lineHeight: "28px" }],
        "heading": ["24px", { lineHeight: "32px" }],
        "heading-lg": ["28px", { lineHeight: "36px" }],
        "display": ["34px", { lineHeight: "42px" }],
      },
      minHeight: {
        "touch": "56px",
        "touch-lg": "64px",
      },
      minWidth: {
        "touch": "56px",
      },
      borderRadius: {
        "xl": "12px",
        "2xl": "16px",
        "3xl": "20px",
      },
    },
  },
  plugins: [],
};
