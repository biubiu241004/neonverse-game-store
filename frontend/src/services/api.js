import axios from "axios";

// Deteksi otomatis environment
const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? "https://neonverse-game-store-production.up.railway.app" // langsung arahkan ke Railway biar gak ke localhost
    : "https://neonverse-game-store-production.up.railway.app";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
