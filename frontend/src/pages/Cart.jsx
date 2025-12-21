import { useEffect, useState } from "react";
import api from "../services/api";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("⚠️ You must be logged in to view your cart.");
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart(res.data.items || []);
      } catch (err) {
        console.error("Error fetching cart:", err);
        setError("❌ Failed to load cart. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem("token");

      const formattedItems = cart.map((item) => ({
        gameId: item.game._id,
        quantity: item.quantity,
      }));

      const res = await api.post(
        "/api/orders/checkout",
        { items: formattedItems },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Checkout berhasil!");
      setCart([]); 
    } catch (error) {
      alert(error.response?.data?.message || "Checkout gagal");
    }
  };

  const handleRemove = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("⚠️ You must be logged in!");

    try {
      await api.delete(`/api/cart/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(cart.filter((item) => item.game._id !== id));
    } catch (err) {
      console.error("Error removing item:", err);
      alert("❌ Failed to remove item. Please try again.");
    }
  };

  if (loading) {
    return <div className="text-center mt-20 text-neonBlue text-xl">Loading your cart...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-400 text-lg">{error}</div>;
  }

  return (
    <div className="p-10 min-h-screen bg-darkBg text-white">
      <h1 className="text-4xl text-neonPink mb-8 text-center font-orbitron">
        🛒 Your Cart
      </h1>

      {cart.length === 0 ? (
        <p className="text-center text-gray-400">Your cart is empty.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cart.map(({ game, quantity }) => (
            <div
              key={game._id}
              className="bg-[#111] rounded-2xl p-4 shadow-neon border border-neonPurple"
            >
              <img
                src={game.image}
                onError={(e) => {
                  e.target.src = "https://placehold.co/300x200?text=No+Image";
                }}
                alt={game.title}
                className="rounded-lg mb-4 w-full h-48 object-cover"
              />

              <h2 className="text-neonGreen text-2xl font-bold">{game.title}</h2>
              <p className="text-gray-400 mt-2">Qty: {quantity}</p>
              <p className="text-neonBlue mt-2 font-semibold">
                Rp {game.price?.toLocaleString("id-ID")}
              </p>

              <button
                onClick={() => handleRemove(game._id)}
                className="mt-4 w-full py-2 bg-neonPink text-darkBg font-bold rounded-lg hover:scale-105 transition-transform"
              >
                Remove
              </button>

              <button
                onClick={handleCheckout}
                className="mt-5 bg-neonPink px-6 py-3 rounded-lg text-darkBg font-bold hover:scale-105"
              >
                Checkout
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
