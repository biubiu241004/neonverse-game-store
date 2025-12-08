import { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminGames() {
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
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("token");
  const decoded = JSON.parse(atob(token.split(".")[1]));

  const fetchGames = async () => {
    try {
      const res = await api.get("/api/games");
      const adminId = decoded.id;

      setGames(res.data.filter((g) => g.createdBy === adminId));
    } catch (error) {
      console.error("Gagal memuat game:", error);
    }
  };

  const uploadImageHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const res = await api.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setForm((prev) => ({ ...prev, image: res.data.imageUrl }));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/games/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Game berhasil diperbarui!");
      } else {
        await api.post(
          "/api/games/add",
          { ...form, createdBy: decoded.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Game berhasil ditambahkan!");
      }

      setEditingId(null);
      setForm({
        title: "",
        description: "",
        price: "",
        stock: "",
        rating: "",
        image: "",
      });

      fetchGames();
    } catch {
      alert("Gagal menyimpan game");
    }
  };

  const deleteGame = async (id) => {
    await api.delete(`/api/games/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchGames();
  };

  useEffect(() => {
    fetchGames();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* LIST GAME */}
      <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map((game) => (
          <div
            key={game._id}
            className="p-4 bg-[#111] border border-neonPurple rounded-lg"
          >
            <img
              src={game.image}
              className="w-full h-48 object-cover rounded mb-3"
            />

            <h3 className="text-neonPink text-xl font-bold">{game.title}</h3>

            <button
              className="text-yellow-400 relative z-50"
              onClick={() => {
                setEditingId(game._id);
                setForm(game);
              }}
            >
              Edit
            </button>

            <button
              className="text-red-400 ml-3"
              onClick={() => deleteGame(game._id)}
            >
              Hapus
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
