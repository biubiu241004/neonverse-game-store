/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neonPurple: "#8B5CF6",
        neonBlue: "#00CFFF",
        neonPink: "#FF00A0",
        neonGreen: "#39FF14",
        darkBg: "#0A0A0F",
      },
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 15px rgba(139, 92, 246, 0.8)",
      },
    },
  },
  plugins: [],
};
