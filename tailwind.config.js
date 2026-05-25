/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#e9eef4",
          100: "#d3ddea",
          200: "#bdcde0",
          300: "#a7bcd6",
          400: "#91accc",
          500: "#235999",
          600: "#235999",
          700: "#1e4d87",
          800: "#183e6b",
          900: "#15355b",
        },
        surface: {
          page: "#F6F8FB",
          card: "#FFFFFF",
          subtle: "#F8FAFC",
          header: "#EEF3F8",
        },
        border: {
          DEFAULT: "#E5EAF0",
          strong: "#CBD5E1",
        },
        muted: {
          50: "#F8FAFC",
          100: "#EEF3F8",
          200: "#E5EAF0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
        status: {
          success: "#059669",
          successSoft: "#ECFDF5",
          warning: "#B45309",
          warningSoft: "#FFFBEB",
          danger: "#DC2626",
          dangerSoft: "#FEF2F2",
        },
      },
      boxShadow: {
        soft: "0 18px 45px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
