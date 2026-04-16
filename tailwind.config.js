/** @type {import('tailwindcss').Config} */
const primeui = require("tailwindcss-primeui");

export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: ["selector", '[class="p-dark"]'],
  theme: {
    extend: {
      colors: {
        // Brand palette
        primary: {
          DEFAULT: "#01696f",
          hover: "#0c4e54",
          active: "#0f3638",
          highlight: "#cedcd8",
        },
        // Surface / neutral warm
        surface: {
          base: "#f7f6f2",
          card: "#f9f8f5",
          offset: "#f3f0ec",
        },
        // Content / text
        content: {
          DEFAULT: "#28251d",
          muted: "#7a7974",
          faint: "#bab9b4",
        },
        // Semantic app colors — driven by PrimeVue theme variables
        "app-bg": "var(--app-bg)",
        "app-surface": "var(--app-surface)",
        "app-surface-hover": "var(--app-surface-hover)",
        "app-surface-active": "var(--app-surface-active)",
        "app-text": "var(--app-text)",
        "app-text-secondary": "var(--app-text-secondary)",
        "app-text-muted": "var(--app-text-muted)",
        "app-text-faint": "var(--app-text-faint)",
        "app-border": "var(--app-border)",
        "app-border-hover": "var(--app-border-hover)",
        "app-divider": "var(--app-divider)",
        "app-primary": "var(--app-primary)",
        "app-primary-hover": "var(--app-primary-hover)",
        "app-primary-light": "var(--app-primary-light)",
        "app-primary-text": "var(--app-primary-text)",
        "app-success": "var(--app-success)",
        "app-success-bg": "var(--app-success-bg)",
        "app-success-border": "var(--app-success-border)",
        "app-success-text": "var(--app-success-text)",
        "app-warning": "var(--app-warning)",
        "app-warning-bg": "var(--app-warning-bg)",
        "app-warning-border": "var(--app-warning-border)",
        "app-warning-text": "var(--app-warning-text)",
        "app-error": "var(--app-error)",
        "app-error-bg": "var(--app-error-bg)",
        "app-error-border": "var(--app-error-border)",
        "app-error-text": "var(--app-error-text)",
        "app-info": "var(--app-info)",
        "app-info-bg": "var(--app-info-bg)",
        "app-info-border": "var(--app-info-border)",
        "app-info-text": "var(--app-info-text)",
        "app-overlay-bg": "var(--app-overlay-bg)",
        // Chart palette
        "chart-1": "var(--chart-1)",
        "chart-2": "var(--chart-2)",
        "chart-3": "var(--chart-3)",
        "chart-4": "var(--chart-4)",
        "chart-5": "var(--chart-5)",
      },
      backgroundColor: {
        "app-bg": "var(--app-bg)",
        "app-surface": "var(--app-surface)",
        "app-surface-hover": "var(--app-surface-hover)",
        "app-surface-active": "var(--app-surface-active)",
        "app-primary-light": "var(--app-primary-light)",
        "app-success-bg": "var(--app-success-bg)",
        "app-warning-bg": "var(--app-warning-bg)",
        "app-error-bg": "var(--app-error-bg)",
        "app-info-bg": "var(--app-info-bg)",
      },
      textColor: {
        "app-text": "var(--app-text)",
        "app-text-secondary": "var(--app-text-secondary)",
        "app-text-muted": "var(--app-text-muted)",
        "app-text-faint": "var(--app-text-faint)",
        "app-primary-text": "var(--app-primary-text)",
        "app-success-text": "var(--app-success-text)",
        "app-warning-text": "var(--app-warning-text)",
        "app-error-text": "var(--app-error-text)",
        "app-info-text": "var(--app-info-text)",
      },
      borderColor: {
        "app-border": "var(--app-border)",
        "app-border-hover": "var(--app-border-hover)",
        "app-success-border": "var(--app-success-border)",
        "app-warning-border": "var(--app-warning-border)",
        "app-error-border": "var(--app-error-border)",
        "app-info-border": "var(--app-info-border)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.06)",
        hover: "0 4px 12px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [primeui],
};
