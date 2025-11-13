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
  const [editingId, setEditingId] = useState(null); // <-- MODE EDIT
  const token = localStorage.getItem("token");
  const decoded = JSON.parse(atob(token.split(".")[1]));

  // ============================
  // GET GAME MILIK ADMIN
  // ============================
  const fetchGames = async () => {
    try {
      const res = await api.get("/api/games");
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const adminId = decoded.id;

      const myGames = res.data.filter((g) => g.createdBy === adminId);
      setGames(myGames);
    } catch (error) {
      console.error("Gagal memuat game:", error);
    }
  };

  // ============================
  // UPLOAD GAMBAR
  // ============================
  const uploadImageHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);

    // Preview langsung
    setForm({ ...form, image: URL.createObjectURL(file) });

    try {
      setUploading(true);
      const res = await api.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setForm((prev) => ({ ...prev, image: res.data.imageUrl }));
    } catch (error) {
      console.error("Gagal upload gambar:", error);
      alert("❌ Upload gambar gagal");
    } finally {
      setUploading(false);
    }
  };

  // ==========================================
  // HANDLE SUBMIT → TAMBAH atau EDIT
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        // MODE EDIT
        await api.put(`/api/games/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Game berhasil diperbarui!");
      } else {
        // MODE TAMBAH
        await api.post(
          "/api/games/add",
          {
            ...form,
            createdBy: decoded.id, // 🔥 INI YANG WAJIB ADA
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert("Game berhasil ditambahkan!");
      }

      fetchGames();

      setForm({
        title: "",
        description: "",
        price: "",
        stock: "",
        rating: "",
        image: "",
      });

      setEditingId(null);
    } catch (error) {
      console.error(error);
      alert("❌ Gagal menyimpan game");
    }
  };

  // ============================
  // DELETE GAME
  // ============================
  const deleteGame = async (id) => {
    try {
      await api.delete(`/api/games/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchGames();
    } catch (error) {
      alert("❌ Tidak bisa hapus game");
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

      {/* ============================
          FORM INPUT 
      ============================ */}
      <form
        onSubmit={handleSubmit}
        className="mb-10 bg-[#111] p-6 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.5)] max-w-lg"
      >
        <h2 className="text-xl font-bold text-neonBlue mb-4">
          {editingId ? "Edit Game" : "Tambah Game Baru"}
        </h2>

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
          placeholder="Rating (0-5)"
          max="5"
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

        {form.image && (
          <img
            src={
              form.image.startsWith("/uploads")
                ? `http://localhost:8080${form.image}`
                : form.image
            }
            alt="Preview"
            className="w-full h-48 object-cover rounded mb-3 border border-neonPurple"
          />
        )}

        <button
          type="submit"
          className="w-full py-3 mt-3 bg-gradient-to-r from-neonPink to-neonPurple text-darkBg font-bold rounded-lg hover:scale-105 transition-transform"
        >
          {editingId ? "Simpan Perubahan" : "Tambahkan Game"}
        </button>
      </form>

      {/* ============================
          LIST GAME 
      ============================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {games.map((game) => (
          <div
            key={game._id}
            className="p-4 bg-[#111] border border-neonPurple rounded-lg text-center"
          >
            <img
              src={
                game.image?.startsWith("http")
                  ? game.image
                  : `http://localhost:8080${game.image}`
              }
              className="rounded-lg mb-4 w-full h-48 object-cover"
            />
            <h3 className="text-neonPink text-xl font-bold">{game.title}</h3>

            <button
              onClick={() => {
                setEditingId(game._id);
                setForm({
                  title: game.title,
                  description: game.description,
                  price: game.price,
                  stock: game.stock,
                  rating: game.rating,
                  image: game.image,
                });
              }}
              className="text-yellow-400 hover:text-yellow-300 transition mr-3"
            >
              Edit
            </button>

            <button
              onClick={() => deleteGame(game._id)}
              className="text-red-400 hover:text-red-600 transition"
            >
              Hapus
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
