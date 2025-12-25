import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

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
        console.error(err);
        setError("❌ Failed to load cart.");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const toggleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleRemove = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await api.delete(`/api/cart/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCart(cart.filter((item) => item.game._id !== id));
      setSelectedItems(selectedItems.filter((x) => x !== id));
    } catch {
      alert("Gagal menghapus item");
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Pilih minimal 1 item");
      return;
    }

    navigate("/checkout", {
      state: {
        items: cart.filter((i) => selectedItems.includes(i.game._id)),
      },
    });
  };
  
  if (loading) {
    return (
      <div className="text-center mt-20 text-neonBlue text-xl">
        Loading your cart...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-20 text-red-400 text-lg">{error}</div>
    );
  }

  return (
    <div className="p-10 min-h-screen bg-darkBg text-white">
      <h1 className="text-4xl text-neonPink mb-8 text-center font-orbitron">
        🛒 Keranjang Saya
      </h1>

      {cart.length === 0 ? (
        <p className="text-center text-gray-400">Keranjang kosong.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {cart.map(({ game, quantity }) => (
              <div
                key={game._id}
                className="bg-[#111] rounded-2xl p-4 border border-neonPurple"
              >
                {/* CHECKBOX */}
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(game._id)}
                    onChange={() => toggleSelect(game._id)}
                  />
                  <span className="text-sm text-gray-300">Pilih item</span>
                </div>

                <img
                  src={game.image}
                  onError={(e) =>
                    (e.target.src =
                      "https://placehold.co/300x200?text=No+Image")
                  }
                  alt={game.title}
                  className="rounded-lg mb-4 w-full h-48 object-cover"
                />

                <h2 className="text-neonGreen text-xl font-bold">
                  {game.title}
                </h2>

                <p className="text-gray-400 mt-1">Qty: {quantity}</p>

                <p className="text-neonBlue mt-2 font-semibold">
                  Rp {game.price.toLocaleString("id-ID")}
                </p>

                <button
                  onClick={() => handleRemove(game._id)}
                  className="mt-4 w-full py-2 bg-red-600 rounded-lg font-bold hover:bg-red-700"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>

          {/* CHECKOUT BAR */}
          <div className="fixed bottom-0 left-0 w-full bg-[#0b0b14] border-t border-neonPurple p-4 flex justify-between items-center">
            <p className="text-sm text-gray-300">
              {selectedItems.length} item dipilih
            </p>

            <button
              disabled={selectedItems.length === 0}
              onClick={handleCheckout}
              className="bg-neonPink px-6 py-3 rounded-lg font-bold disabled:bg-gray-600"
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
