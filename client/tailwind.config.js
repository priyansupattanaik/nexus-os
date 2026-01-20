/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        nexus: {
          // The new "Holographic" Palette
          bg: "#050505", // True Void Black
          panel: "rgba(10, 10, 15, 0.8)", // Dark semi-transparent (Fast render)
          border: "rgba(0, 255, 255, 0.2)", // Cyan Hologram Edge
          accent: "#00f3ff", // Electric Cyan
          secondary: "#7000ff", // Neon Purple
          text: "#e0f7fa", // Pale Cyan Text (High Contrast)
          subtext: "#5c7c8a", // Dimmed Interface Text
          success: "#00ff9d", // Matrix Green
          danger: "#ff0055", // Cyber Red
        },
      },
      backgroundImage: {
        "holo-grid":
          "radial-gradient(circle at center, transparent 0%, #000 100%), linear-gradient(rgba(0, 243, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.03) 1px, transparent 1px)",
      },
      animation: {
        "spin-slow": "spin 10s linear infinite",
        "pulse-fast": "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        scanline: "scanline 8s linear infinite",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
