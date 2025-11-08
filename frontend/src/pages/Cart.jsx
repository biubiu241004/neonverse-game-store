import { useEffect, useState } from "react";
import axios from "axios";

export default function Cart() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await axios.get("http://localhost:5000/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart(res.data.items || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCart();
  }, []);

  const handleRemove = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5000/api/cart/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(cart.filter((item) => item.game._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-10 min-h-screen bg-darkBg text-white">
      <h1 className="text-4xl text-neonPink mb-8 text-center font-orbitron">
        🛒 Your Cart
      </h1>
      {cart.length === 0 ? (
        <p className="text-center text-gray-400">Your cart is empty</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cart.map(({ game, quantity }) => (
            <div
              key={game._id}
              className="bg-[#111] rounded-2xl p-4 shadow-neon border border-neonPurple"
            >
              <img
                src={game.image}
                alt={game.title}
                className="rounded-lg mb-3 w-full h-48 object-cover"
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
