import type { Config } from "tailwindcss";

// The design tokens are CSS variables (ported from the old app in step 2,
// docs/parity/app-shell.md); components use them as arbitrary values,
// e.g. bg-[var(--color-container-background-primary)], as the old app does.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {}
  },
  plugins: []
};

export default config;
