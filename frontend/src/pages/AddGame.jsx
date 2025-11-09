import { useState } from "react";
import api from "../services/api";

export default function AddGame() {
  const [form, setForm] = useState({
    title: "",
    price: "",
    stock: "",
    rating: "",
    image: "",
    description: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return setMessage("⚠️ You must be logged in as admin!");

    try {
      // 🚀 POST request ke backend Railway atau localhost otomatis
      await api.post("/api/games", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("✅ Game added successfully!");
      setForm({
        title: "",
        price: "",
        stock: "",
        rating: "",
        image: "",
        description: "",
      });
    } catch (err) {
      console.error("Error adding game:", err);
      setMessage(err.response?.data?.message || "❌ Failed to add game");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-darkBg text-white p-6">
      <h1 className="text-4xl text-neonPurple mb-8 font-orbitron">
        Add New Game 🎮
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-[#111] p-8 rounded-2xl w-full max-w-lg shadow-neon"
      >
        {["title", "price", "stock", "rating", "image", "description"].map(
          (field) => (
            <input
              key={field}
              type={
                field === "price" || field === "stock" || field === "rating"
                  ? "number"
                  : "text"
              }
              name={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={form[field]}
              onChange={handleChange}
              className="w-full p-3 mb-4 rounded bg-darkBg border border-neonPurple outline-none"
              required
            />
          )
        )}

        <button
          type="submit"
          className="w-full py-3 bg-neonPink text-darkBg font-bold rounded-lg hover:scale-105 transition-transform"
        >
          Add Game
        </button>
      </form>

      {message && <p className="mt-4 text-neonBlue">{message}</p>}
    </div>
  );
}
