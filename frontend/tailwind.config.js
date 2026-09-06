import daisyui from "daisyui"

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        // Serif for headings gives the marketplace a shopfront feel;
        // the grotesque keeps dense product data readable.
        display: ['"Fraunces"', 'Georgia', 'Cambria', 'serif'],
        sans: ['"Inter Tight"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightish: "-0.015em",
      },
      boxShadow: {
        card: "0 1px 2px rgb(28 27 23 / 0.04), 0 1px 3px rgb(28 27 23 / 0.06)",
        lift: "0 2px 4px rgb(28 27 23 / 0.05), 0 8px 24px -8px rgb(28 27 23 / 0.14)",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        riseIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 140ms ease-out",
        riseIn: "riseIn 180ms cubic-bezier(0.2, 0.7, 0.3, 1)",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    logs: false,
    themes: [
      {
        light: {
          primary: "#2a5446",
          "primary-content": "#f8f4ea",
          secondary: "#9c6f4a",
          "secondary-content": "#fdf8f1",
          accent: "#b4552c",
          "accent-content": "#fdf5ee",
          neutral: "#33281d",
          "neutral-content": "#f6eee1",
          "base-100": "#fdf9f2",
          "base-200": "#f4ece0",
          "base-300": "#e3d7c4",
          "base-content": "#2a2118",
          info: "#356580",
          success: "#2f6b4f",
          warning: "#96681b",
          error: "#a53c26",
          "--rounded-box": "0.625rem",
          "--rounded-btn": "0.4rem",
          "--rounded-badge": "0.3rem",
          "--border-btn": "1px",
          "--btn-text-case": "none",
          "--animation-btn": "0.15s",
        },
      },
      {
        dark: {
          primary: "#6fbf9c",
          "primary-content": "#0e2019",
          secondary: "#c69a74",
          "secondary-content": "#241a12",
          accent: "#e2724b",
          "accent-content": "#241009",
          neutral: "#2b2c28",
          "neutral-content": "#e9e7e1",
          "base-100": "#1b1c19",
          "base-200": "#141512",
          "base-300": "#2c2e29",
          "base-content": "#e7e5df",
          info: "#7bb2cc",
          success: "#72b78f",
          warning: "#d9ab4e",
          error: "#e07a68",
          "--rounded-box": "0.625rem",
          "--rounded-btn": "0.4rem",
          "--rounded-badge": "0.3rem",
          "--border-btn": "1px",
          "--btn-text-case": "none",
          "--animation-btn": "0.15s",
        },
      },
    ],
  },
}
