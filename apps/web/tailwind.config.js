/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--color-bg)",
        "background-alt": "var(--color-bg-alt)",
        sidebar: "var(--color-sidebar)",
        foreground: "var(--color-text)",
        secondary: "var(--color-secondary)",
        muted: {
          DEFAULT: "var(--color-muted)",
          foreground: "var(--color-secondary)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          faint: "var(--color-accent-faint)",
        },
        border: "var(--color-border)",
        "border-mid": "var(--color-border-mid)",
        input: "var(--color-border-mid)",
        ring: "var(--color-accent)",
        // shadcn semantic tokens
        primary: {
          DEFAULT: "var(--color-accent)",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#e54d2e",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "var(--color-bg)",
          foreground: "var(--color-text)",
        },
        popover: {
          DEFAULT: "var(--color-bg)",
          foreground: "var(--color-text)",
        },
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Outfit", "system-ui", "sans-serif"],
      },
      borderRadius: {
        ui: "var(--radius-ui)",
        lg: "var(--radius-ui)",
        md: "calc(var(--radius-ui) - 2px)",
        sm: "calc(var(--radius-ui) - 4px)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
