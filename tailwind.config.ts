import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "var(--color-primary, #087A55)",
          hover: "var(--color-primary-hover, #066747)",
          soft: "var(--color-primary-soft, #DDF3E8)",
          tint: "var(--color-primary-tint, #EDF4EF)",
        },
        forest: {
          DEFAULT: "var(--color-deep-forest, #063B2E)",
          hover: "var(--color-deep-forest-hover, #052F25)",
        },
        mint: {
          DEFAULT: "var(--color-primary-soft, #DDF3E8)",
          subtle: "var(--color-primary-tint, #EDF4EF)",
        },
        accent: {
          DEFAULT: "var(--color-accent, #12A875)",
        },
        surface: {
          DEFAULT: "var(--color-surface, #FFFFFF)",
          subtle: "var(--color-surface-subtle, #EDF4EF)",
          background: "var(--color-app-bg, #F5F9F6)",
        },
        heading: "var(--color-heading, #172B24)",
        link: {
          DEFAULT: "var(--color-link, #087A55)",
          hover: "var(--color-primary-hover, #066747)",
        },
        divider: "var(--color-divider, #E1EAE4)",
        footer: {
          DEFAULT: "var(--color-footer-bg, #063B2E)",
          bg: "var(--color-footer-bg, #063B2E)",
        },
        card: {
          DEFAULT: "var(--color-card-bg, #FFFFFF)",
          bg: "var(--color-card-bg, #FFFFFF)",
        },
        section: {
          DEFAULT: "var(--color-section-bg, #FFFFFF)",
          bg: "var(--color-section-bg, #FFFFFF)",
          alt: "var(--color-alt-section-bg, #EDF4EF)",
        },
        page: {
          DEFAULT: "var(--color-page-bg, #F5F9F6)",
          bg: "var(--color-page-bg, #F5F9F6)",
        },
        btn: {
          primary: {
            bg: "var(--btn-primary-bg, #087A55)",
            text: "var(--btn-primary-text, #FFFFFF)",
            hover: "var(--btn-hover-bg, #066747)",
            border: "var(--btn-border, #087A55)",
          },
          secondary: {
            bg: "var(--btn-secondary-bg, #FFFFFF)",
            text: "var(--btn-secondary-text, #172B24)",
            border: "var(--btn-border, #E1EAE4)",
          },
        },
        input: {
          DEFAULT: "var(--color-input-bg, #FFFFFF)",
          bg: "var(--color-input-bg, #FFFFFF)",
          border: "var(--color-input-border, #E1EAE4)",
          text: "var(--color-input-text, #172B24)",
          placeholder: "var(--color-input-placeholder, #8E9F96)",
        },
        icon: {
          DEFAULT: "var(--color-icon, #087A55)",
        },
        border: {
          DEFAULT: "var(--color-border, #E1EAE4)",
          strong: "var(--color-border-strong, #C8D7CE)",
        },
        text: {
          primary: "var(--color-text-primary, #172B24)",
          secondary: "var(--color-text-secondary, #64756C)",
          muted: "var(--color-text-muted, #8E9F96)",
        },
        status: {
          success: "var(--color-success, #168653)",
          "success-soft": "var(--color-success-soft, #DDF3E8)",
          warning: "var(--color-warning, #D99024)",
          "warning-soft": "var(--color-warning-soft, #FEF3E2)",
          danger: "var(--color-danger, #D94848)",
          "danger-soft": "var(--color-danger-soft, #FDE8E8)",
          info: "var(--color-info, #087A55)",
        },
      },
      borderRadius: {
        card: "var(--radius-card, 16px)",
        btn: "var(--radius-button, 10px)",
        input: "var(--radius-input, 8px)",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 30s linear infinite",
      },
      fontFamily: {
        sans: ["var(--font-sans, Inter)", "sans-serif"],
        heading: ["var(--font-heading, Inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
