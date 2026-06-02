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
        ink: {
          50: "#F6F8FB",
          100: "#F8FAFC",
          200: "#EEF3F8",
          300: "#E5EAF0",
          400: "#CBD5E1",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
        signal: {
          amber: "#d89022",
          coral: "#da6255",
          mint: "#42b892",
          cyan: "#17b8d8",
          violet: "#6d5dfc",
        },
        surface: {
          page: "#EAF0F7",
          card: "#F9FBFD",
          subtle: "#F1F5FA",
          header: "#E1E9F3",
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
      borderRadius: {
        ui: "8px",
      },
    },
  },
  plugins: [],
};
