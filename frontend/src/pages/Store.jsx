import { useEffect, useState } from "react";
import api from "../services/api";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";

export default function Store() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [role, setRole] = useState("user");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role || "user");
      } catch {
        setRole("user");
      }
    }
  }, []);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await api.get("/api/games");
        setGames(res.data);
      } catch (err) {
        console.error("Error fetching games:", err);
        setError("❌ Failed to load games. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-20 text-neonBlue text-xl animate-pulse">
        ⚡ Loading games...
      </div>
    );
  }

  if (error) {
    return <div className="text-center mt-20 text-red-400 text-lg">{error}</div>;
  }

  return (
    <div className="p-10 min-h-screen bg-darkBg text-white">
      <h1 className="text-4xl text-neonBlue font-orbitron mb-8 text-center">
        ⚡ Game Store ⚡
      </h1>

      {games.length === 0 ? (
        <p className="text-center text-gray-400">No games available yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {games.map((game) => (
            <Link key={game._id} to={`/game/${game._id}`} className="block group">
              <motion.div
                whileHover={{
                  scale: 1.05,
                  rotateY: 5,
                  boxShadow: "0 0 25px rgba(139, 92, 246, 0.8)",
                }}
                transition={{ duration: 0.3, type: "spring" }}
                className="bg-[#111] rounded-2xl p-4 border border-neonPurple text-center hover:border-neonPink transform-gpu"
              >
                <img
                  src={game.image}
                  onError={(e) => {
                    e.target.src = "https://placehold.co/300x200?text=No+Image";
                  }}
                  alt={game.title}
                  className="rounded-lg mb-4 w-full h-48 object-cover"
                />

                <h2 className="text-neonPink text-2xl font-bold group-hover:underline">
                  {game.title}
                </h2>

                <p className="text-gray-300 mt-2 text-sm line-clamp-2">
                  {game.description || "No description available."}
                </p>

                <p className="text-neonGreen mt-3 font-semibold">
                  Rp {game.price?.toLocaleString("id-ID")}
                </p>

                <div className="flex justify-between text-sm text-gray-400 mt-2">
                  <span>⭐ {game.rating || 0}</span>
                  <span>Stock: {game.stock || 0}</span>
                </div>

                {role === "admin" && (
                  <p className="mt-4 text-gray-400 text-sm italic">
                    Admin tidak bisa membeli produk.
                  </p>
                )}
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
