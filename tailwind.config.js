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
        primary: "#0F766E", // Deep teal, calming and high contrast
        "primary-dark": "#0D9488", // Slightly lighter for dark mode
        accent: "#F59E0B",
        "accent-dark": "#D97706",
        surface: "#F9FAFB", // Soft gray page background
        "surface-dark": "#1E1E1E",
        navy: "#111827", // Almost black for high readability
        "navy-dark": "#E5E7EB", // Light gray for crisp dark mode text
        background: "#FFFFFF",
        "background-dark": "#121212",
        error: "#DC2626",
        success: "#16A34A",
      },
      fontSize: {
        "body": ["18px", { lineHeight: "26px" }],
        "body-lg": ["20px", { lineHeight: "28px" }],
        "heading": ["24px", { lineHeight: "32px" }],
        "heading-lg": ["28px", { lineHeight: "36px" }],
        "display": ["32px", { lineHeight: "40px" }],
        "otp": ["28px", { lineHeight: "36px" }],
      },
      minHeight: {
        "touch": "56px",
        "touch-lg": "64px",
      },
      minWidth: {
        "touch": "56px",
      },
      boxShadow: {
        "soft": "0px 4px 12px rgba(0, 0, 0, 0.05)",
      },
      borderRadius: {
        "xl": "12px",
        "2xl": "16px",
      }
    },
  },
  plugins: [],
};
