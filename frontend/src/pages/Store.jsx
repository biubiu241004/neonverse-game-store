import { useEffect, useState } from "react";
import api from "../api";
import { motion } from "framer-motion";

export default function Store() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await api.get("/api/games");
        setGames(res.data);
      } catch (err) {
        console.error("Error fetching games:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-20 text-neonBlue text-xl">
        Loading games...
      </div>
    );
  }

  const handleAddToCart = async (gameId) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in!");

    try {
       await api.post(s
        "http://localhost:5000/api/cart/add",
        { gameId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Game added to cart!");
    } catch (err) {
      console.error(err);
      alert("Failed to add to cart");
    }
  };

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
            <motion.div
              key={game._id}
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                boxShadow: "0 0 25px rgba(139, 92, 246, 0.8)",
              }}
              transition={{ duration: 0.3, type: "spring" }}
              className="bg-[#111] rounded-2xl p-4 border border-neonPurple text-center hover:border-neonPink transform-gpu"
            >
              <img
                src={
                  game.image ||
                  "https://via.placeholder.com/300x200?text=No+Image"
                }
                alt={game.title}
                className="rounded-lg mb-4 w-full h-48 object-cover"
              />
              <h2 className="text-neonPink text-2xl font-bold">{game.title}</h2>
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

              <motion.button
                whileHover={{
                  scale: 1.08,
                  boxShadow: "0 0 20px rgba(255,0,160,0.8)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAddToCart(game._id)}
                className="mt-4 w-full py-2 bg-gradient-to-r from-neonPink to-neonPurple text-darkBg font-bold rounded-lg transition-all"
              >
                Add to Cart
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
