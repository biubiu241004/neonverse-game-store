import { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminDashboard() {
  const [games, setGames] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    rating: "",
    image: "",
  });
  const [uploading, setUploading] = useState(false);
  const token = localStorage.getItem("token");

  const fetchGames = async () => {
    try {
      const res = await api.get("/api/games");
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const adminId = decoded.id;
      const myGames = res.data.filter((game) => game.createdBy === adminId);
      setGames(myGames);
    } catch (error) {
      console.error("Gagal memuat game:", error);
    }
  };

  const uploadImageHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);

    // 🧩 preview langsung sebelum upload
    const localPreview = URL.createObjectURL(file);
    setForm({ ...form, image: localPreview });

    try {
      setUploading(true);
      const res = await api.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // kalau upload sukses → ganti URL local dengan URL dari server
      setForm({ ...form, image: res.data.imageUrl });
    } catch (error) {
      console.error("Gagal upload gambar:", error);
      alert("❌ Upload gambar gagal");
    } finally {
      setUploading(false);
    }
  };

  const addGame = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/games/add", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchGames();
      setForm({
        title: "",
        description: "",
        price: "",
        stock: "",
        rating: "",
        image: "",
      });
    } catch (error) {
      alert("❌ Gagal menambahkan game");
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  return (
    <div className="p-10 text-white bg-darkBg min-h-screen">
      <h1 className="text-3xl font-bold text-neonPink mb-6">
        Dashboard Admin 🎮
      </h1>

      <form
        onSubmit={addGame}
        className="mb-10 bg-[#111] p-6 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.5)] max-w-lg"
      >
        <input
          type="text"
          placeholder="Nama Game"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full p-3 mb-3 bg-darkBg border border-neonPurple rounded"
          required
        />

        <textarea
          placeholder="Deskripsi Game"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full p-3 mb-3 bg-darkBg border border-neonPurple rounded"
          required
        ></textarea>

        <input
          type="number"
          placeholder="Harga (Rp)"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="w-full p-3 mb-3 bg-darkBg border border-neonPurple rounded"
          required
        />

        <input
          type="number"
          placeholder="Stok"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
          className="w-full p-3 mb-3 bg-darkBg border border-neonPurple rounded"
        />

        <input
          type="number"
          step="0.1"
          max="5"
          placeholder="Rating (0-5)"
          value={form.rating}
          onChange={(e) => setForm({ ...form, rating: e.target.value })}
          className="w-full p-3 mb-3 bg-darkBg border border-neonPurple rounded"
        />

        <input
          type="file"
          accept="image/*"
          onChange={uploadImageHandler}
          className="w-full p-3 mb-3 bg-darkBg border border-neonPurple rounded"
        />
        {uploading && <p className="text-gray-400">📤 Mengupload gambar...</p>}

        {form.image && (
          <img
            src={form.image}
            alt="Preview"
            className="w-full h-48 object-cover rounded mb-3 border border-neonPurple"
          />
        )}

        <button
          type="submit"
          className="w-full py-3 mt-3 bg-gradient-to-r from-neonPink to-neonPurple text-darkBg font-bold rounded-lg hover:scale-105 transition-transform"
        >
          Tambahkan Game
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {games.map((game) => (
          <div
            key={game._id}
            className="p-4 bg-[#111] border border-neonPurple rounded-lg text-center"
          >
            <img
              src={
                game.image?.startsWith("http")
                  ? game.image // kalau dari Cloudinary/external
                  : `http://localhost:8080${game.image}` // ambil dari backend local
              }
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/300x200?text=No+Image";
              }}
              alt={game.title}
              className="rounded-lg mb-4 w-full h-48 object-cover"
            />

            <h3 className="text-neonPink text-xl font-bold">{game.title}</h3>
            <p className="text-gray-400 text-sm">{game.description}</p>
            <p className="text-neonGreen mt-2 font-semibold">
              Rp {Number(game.price).toLocaleString("id-ID")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
