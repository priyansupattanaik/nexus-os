/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        // New "Nexus Glass" Palette
        nexus: {
          glass: "rgba(255, 255, 255, 0.1)", // Base glass layer
          glassHover: "rgba(255, 255, 255, 0.15)", // Slightly brighter interaction
          border: "rgba(255, 255, 255, 0.2)", // Subtle rim light
          text: "#F5F5F7", // Apple Off-White
          subtext: "#86868B", // Apple Grey
          accent: "#0A84FF", // iOS Blue
          dark: "#000000", // Deep Space Black
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // ... keep standard shadcn variables if needed, but we rely on 'nexus'
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
